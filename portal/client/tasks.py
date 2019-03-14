import json
import time

from celery import shared_task
from celery.task.schedules import crontab
from celery.decorators import periodic_task
from django.core.mail import EmailMessage
from django.template.loader import render_to_string

from log.log import logger
from plugin.neutronclient import NeutronClient
from plugin.novaclient import NovaClient
from superadmin.models import Ops, Oders, Server, MyUser


@shared_task
def send_email(mail_subject, content, to_emails, attaches=None):
    mail = EmailMessage(mail_subject, content, to=[to_emails])
    if attaches:
        for key, value in attaches.items():
            mail.attach(key, value)
    mail.send()
    return "Done"


@shared_task
def create_server(type_disk, flavor, image, svname, private_network, count, user, root_pass, price, o_s, cloudinit=None,
                  sshkey=None):
    connect_neutron = NeutronClient(admin=True)
    current_user = MyUser.objects.get(username=user)
    connect = NovaClient(token=current_user.token_id, project_name=current_user.username)
    ops = Ops.objects.all()[0]

    # get flavor
    fl = connect.find_flavor(ram=flavor[0], vcpus=flavor[1], disk=flavor[2])

    # check network
    net = ''
    for network in json.loads(ops.net_provider):
        try:
            ip_net = connect.find_network(network)
        except Exception as e:
            logger.error(e)
            return "Xảy ra lỗi khi tạo network"
        if connect_neutron.free_ips(ip_net=ip_net) > 2:
            net = ip_net
            break
    if net == '':
        logger.error("No IP availability!")
        return "Hết IP"

    # tạo volume
    try:
        im_snap = connect.find_image(image)
        im = connect.find_image(im_snap.base_image_ref)
        snapshot_id = im_snap.block_device_mapping.split('"snapshot_id": "')[1].split('", "device_name":')[0]
        try:
            volume = connect.create_volume(name=svname, size=flavor[2], snapshot_id=snapshot_id)
        except Exception as e:
            logger.error(e)
            return "Không tạo được volume snapshot!"
    except Exception as e:
        logger.error(e)
        im = connect.find_image(image)
        try:
            # volume = connect.create_volume(name=svname, size=flavor.split(',')[2], imageRef=im.id,
            #                                volume_type=type_disk)
            volume = connect.create_volume(name=svname, size=flavor[2], imageRef=im.id)
        except Exception as e:
            logger.error(e)
            return "Không tạo được volume!"
    if volume:
        check = False
        while not check:
            if connect.check_volume(id=volume.id).status == 'error':
                return "Không tạo được volume!"
            elif connect.check_volume(id=volume.id).status == 'available':
                volume_id = volume.id
                break
            else:
                time.sleep(2)
    else:
        return "Không tạo được volume!"

    # tạo vm
    try:
        if o_s is not None:
            server_vm = connect.createVM(svname=svname, flavor=fl, image=im, network_id=net,
                                         private_network=private_network, volume_id=volume_id, max_count=count)
        else:
            # serverVM = connect.createVM(svname=svname, flavor=fl, image=im, network_id=net,
            #                             private_network=private_network, volume_id=volume_id, max_count=count,
            #                             userdata=cloudinit, key_name=sshkey)
            server_vm = connect.createVM(svname=svname, flavor=fl, image=im, network_id=net,
                                         private_network=private_network, volume_id=volume_id, max_count=count,
                                         key_name=sshkey)
    except Exception as e:
        logger.error(e)
        try:
            connect.delete_volume(volume=volume_id)
        except Exception as e:
            logger.error(e)
        return "Không tạo được máy chủ"

    current_user.money = str(float(current_user.money) - float(price))
    current_user.save()
    if current_user.is_trial:
        status = 0
    else:
        status = 1
    Oders.objects.create(service='cloud', price=price, owner=current_user, server=svname, status=status)
    try:
        sv = Server.objects.get(name=svname)
        sv.i_d = server_vm.id
        sv.save()
    except Exception as e:
        logger.error(e)

    while True:
        if connect.get_server(server_vm.id).status != 'BUILD':
            break
        else:
            time.sleep(2)
    try:
        sv = Server.objects.get(name=svname)
        sv.created = server_vm.created
        sv.save()
    except Exception as e:
        logger.error(e)

    mail_subject = 'Thông tin server của bạn là: '

    if private_network == '0':
        ip_private = 'Không có'
    else:
        try:
            ip_private = connect.get_server(server_vm.id).networks[current_user.username][0]
        except Exception as e:
            logger.error(e)
            ip_private = ''

    if o_s is not None:
        rootpassword = 'Cloud@intercom'
    else:
        rootpassword = root_pass

    if sshkey is None:
        ssh_key = 'Không có'
    else:
        ssh_key = sshkey
    message = render_to_string('client/send_info_server.html', {
        'user': current_user,
        'IP_Public': connect.get_server(server_vm.id).networks[network][0],
        'IP_Private': ip_private,
        'Key_pair': ssh_key,
        'Pass_Login': rootpassword
    })
    to_email = current_user.email
    email = EmailMessage(
        mail_subject, message, to=[to_email]
    )
    email.send()
    return 'Đã tạo xong server!'


@periodic_task(
    run_every=(crontab(minute='0', hour='0', day_of_month='*/1')),
    name='check_user_trial',
    ignore_result=True
)
def check_user_trial():
    for user in MyUser.objects.filter(is_adminkvm=False, is_active=True, is_trial=True):
        if not user.check_trial():
            user.is_trial = False
            user.is_block = True
            user.save()
