import binascii
import os
import json
import time

from django.contrib.auth.hashers import check_password
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.contrib.auth import login, logout
from django.contrib.sites.shortcuts import get_current_site
from django.template.loader import render_to_string
from django.urls import reverse
from django.utils import timezone
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes, force_text

from client.decorator import login_require, client_only
from client.tasks import create_server, send_email
from log.log import logger
from plugin.keystoneclient import KeystoneClient
from plugin.neutronclient import NeutronClient
from plugin.novaclient import NovaClient
from superadmin.models import MyUser, Networks, Server, Snapshot, Sshkeys, Ops, Oders, Prices, Images
from superadmin.forms import UserForm, authenticate, UserResetForm, get_user_email, ResetForm
from superadmin.tokens import account_activation_token


# Login 
def user_login(request):
    if request.method == 'POST':
        # Reset mật khẩu
        if 'uemail' in request.POST:
            form = UserResetForm(request.POST)
            if form.is_valid():
                to_email = form.cleaned_data['uemail']
                current_site = get_current_site(request)
                user = get_user_email(to_email)
                mail_subject = 'Làm mới mật khẩu'
                message = render_to_string('client/reset-password.html', {
                    'user': user,
                    'domain': current_site.domain,
                    'uid': urlsafe_base64_encode(force_bytes(user.id)).decode(),
                    'token': account_activation_token.make_token(user)
                })
                send_email.delay(mail_subject, message, to_email)
                return render(request, 'client/signup.html', {'mess': 'Kiểm tra mail để thay đổi mật khẩu !'})
            else: 
                error = ''
                for field in form:
                    error += field.errors
                return render(request, 'client/signup.html', {'messdk': error})
        # đăng nhập
        elif 'agentname' and 'agentpass' in request.POST:
            username = request.POST['agentname']
            password = request.POST['agentpass']
            user = authenticate(username=username, password=password)
            if user is not None:
                if user.is_active:
                    login(request, user)
                    if user.is_adminkvm:
                        return redirect('superadmin:home')
                    else:
                        user.token_id = KeystoneClient(username=user.username, password=user.username,
                                                       project_name=user.username).get_token()
                        user.save()
                        return redirect('client:home')
                else: 
                    return render(request, 'client/signup.html', {'messdk': 'Tài khoản của bạn chưa được kích hoạt'})
            else:
                return render(request, 'client/signup.html', {'messdk': 'Tên đăng nhập hoặc mật khẩu không chính xác'})
        # Đăng ký
        elif 'email' and 'password2' in request.POST:
            user_form = UserForm(request.POST)
            if user_form.is_valid():
                current_site = get_current_site(request)
                user = user_form.save()

                mail_subject = 'Kích hoạt tài khoản Intercom '
                message = render_to_string('client/active_acc.html', {
                    'user': user,
                    'domain': current_site.domain,
                    'uid': urlsafe_base64_encode(force_bytes(user.id)).decode(),
                    'token': account_activation_token.make_token(user)
                })
                send_email.delay(mail_subject, message, user.email)
                return render(request, 'client/signup.html', {'mess': 'Vui lòng vào mail để kích hoạt tài khoản'})
            else:
                error = ''
                for field in user_form:
                    error += field.errors
                return render(request, 'client/signup.html', {'mess': error})
    return render(request, 'client/signup.html')


# Đăng ký
def activate(request, uidb64, token):
    try:
        uid = force_text(urlsafe_base64_decode(uidb64))
        user = MyUser.objects.get(pk=uid)
    except(TypeError, ValueError, OverflowError, ObjectDoesNotExist):
        user = None
    if user is not None and account_activation_token.check_token(user, token):
        user.is_active = True
        user.created = timezone.now()
        user.save()

        # Tạo tk + project + phân quyền OPS
        connect = KeystoneClient(admin=True)
        try:
            connect.create_project(user.username, domain='default')
            connect.create_user(name=user.username, domain='default', email=user.email,
                                project=user.username, password=user.username)
            connect.add_user_to_project(user=user.username, project=user.username)
        except Exception as e:
            logger.error(e)
            user.delete()
            return render(request, 'client/active_acc2.html', {'content': ' Đã có lỗi vui lòng thử lại sau'})

        # Tạo private network
        connect_user = KeystoneClient(username=user.username,
                                      password=user.username,
                                      project_name=user.username)
        try:
            net_id = connect_user.create_network(network_name='private_network_1')
            net = connect_user.show_network(net_id)
            subnet = connect_user.show_subnet(net['network']['subnets'][0])
            if not net['network']['shared']:
                shared = 0
            else:
                shared = 1
            if not net['network']['admin_state_up']:
                admin_state_up = 0
            else:
                admin_state_up = 1
            if not net['network']['router:external']:
                external = 0
            else:
                external = 1
            Networks.objects.create(owner=user, name='private_network_1', subnets_associated=subnet['subnet']['cidr'],
                                    shared=shared, external=external, status=net['network']['status'],
                                    admin_state_up=admin_state_up)
        except Exception as e:
            logger.error(e)
            user.delete()
            return render(request, 'client/active_acc2.html', {'content': ' Đã có lỗi vui lòng thử lại sau'})
        username = user.username
        return render(request, 'client/active_acc2.html', {'content': username})
    else:
        return render(request, 'client/active_acc2.html', {'content': ' Đường đẫn không hợp lệ'})


# Reset password
def resetpwd(request, uidb64, token):
    try:
        uid = force_text(urlsafe_base64_decode(uidb64).decode())
        user = MyUser.objects.get(id=uid)
    except(TypeError, ValueError, OverflowError):
        user = None
    if user is not None and account_activation_token.check_token(user, token):
        if request.method == 'POST':
            form = ResetForm(request.POST)
            if form.is_valid():
                user.set_password(form.cleaned_data)
                user.save()
                return redirect('/')
            else:
                return redirect('/')
        return render(request, 'client/form-reset-password.html')
    else:
        return HttpResponse('Đường dẫn không chính xác')


# Đăng xuất
def user_logout(request):
    logout(request)
    return redirect('client:login')


@login_require
@client_only
def home(request):
    user = request.user
    if request.method == 'POST':
        connect = NovaClient(token=user.token_id, project_name=user.username)
        ops = Ops.objects.all()[0]
        # xóa vm
        if 'delete' in request.POST:
            svname = request.POST['svname']
            svid = request.POST['delete']
            connect.delete_vm(svid=svid)
            try:
                server = Server.objects.get(name=svname, owner=user)
                server.delete()
            except Exception as e:
                logger.error(e)
            time.sleep(1)
        # start vm
        elif 'start' in request.POST:
            svid = request.POST['start']
            connect = NovaClient(token=user.token_id, project_name=user.username)
            try:
                connect.start_vm(svid=svid)
            except Exception as e:
                logger.error(e)
                return HttpResponse("Đã có lỗi xảy ra!")
        # reboot vm
        elif 'reboot' in request.POST:
            svid = request.POST['reboot']
            try:
                connect.reboot_vm(svid=svid)
            except Exception as e:
                logger.error(e)
                return HttpResponse("Đã có lỗi xảy ra!")
        # stop vm
        elif 'stop' in request.POST:
            svid = request.POST['stop']
            try:
                connect.stop_vm(svid=svid)
            except Exception as e:
                logger.error(e)
                return HttpResponse("Đã có lỗi xảy ra!")

        # snapshot vm
        elif 'snapshot' in request.POST:
            svid = request.POST['snapshot']
            snapshotname = request.POST['snapshotname']
            try:
                snapshot = connect.snapshot_vm(svid=svid, snapshotname=snapshotname)
                Snapshot.objects.create(ops=ops, name=snapshotname, owner=user, i_d=snapshot)
            except Exception as e:
                logger.error(e)
                return HttpResponse("Đã có lỗi xảy ra!")
        # elif 'backup' in request.POST:
        #     svid = request.POST['backup']
        #     backup_name = request.POST['backupname']
        #     backup_type = request.POST['backup_type']
        #     rotation = request.POST['rotation']
        #     try:
        #         connect.backup_vm(svid=svid, backup_name=backup_name, backup_type=backup_type, rotation=rotation)
        #     except:
        #         return HttpResponse("Đã có lỗi xảy ra!")
        elif 'sshkeyname' in request.POST:
            try:
                Sshkeys.objects.get(name=request.POST['sshkeyname'])
                return HttpResponse('Tên ssh key đã tồn tại!')
            except Exception as e:
                logger.error(e)
            sshkeyname = request.POST['sshkeyname']
            try:
                key = connect.create_sshkey(sshkeyname=sshkeyname)
            except Exception as e:
                logger.error(e)
                return HttpResponse("Đã có lỗi xảy ra!")
            mail_subject = 'Thông tin key pair: ' + sshkeyname
            message = render_to_string('client/send_info_key.html', {
                'user': user,
                'public_key': key.public_key,
                'key_name': key.name
            })
            to_email = user.email
            attaches = {
                'private.pem': key.private_key,
                'private.txt': key.private_key
            }
            send_email(mail_subject, message, to_email, attaches)
            Sshkeys.objects.create(ops=ops, name=sshkeyname, owner=user)
    return render(request, 'client/home.html', {'content': user.username})


@login_require
@client_only
def home_data(request):
    user = request.user
    connect = NovaClient(token=user.token_id, project_name=user.username)
    servers = Server.objects.filter(owner=user)
    if len(servers) > 0:
        html = ''
    else:
        html = '''
        <tr>
            <td colspan="7">
                Không có máy ảo nào! <a href="%s">Tạo mới ngay</a>
            </td>
        </tr>
        ''' % reverse("client:setup")
    for sv in servers:
        try:
            item = connect.get_server(sv.i_d)
            try:
                ip = '<p>'
                for key, value in item.networks.items():
                    ip += key + '<br>'
                    for i_p in value:
                        ip += i_p + '<br>'
                ip += '</p>'
            except Exception as e:
                ip = '<p></p>'
            try:
                if item.status == 'ACTIVE':
                    status = '<span class="label label-success">%s</span>' % item.status
                    try:
                        link_console = item.get_console_url("novnc")["console"]["url"]
                    except Exception as e:
                        console = ''
                    else:
                        console = """
                        <li>
                            <a data-batch-action="true" class="data-table-action console" data-title="console" id="{link_console}" type="submit"> Console Instance</a>
                        </li>
                        """.format(link_console=link_console)
                    actions = '''
                    <div>
                        <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown">
                            Actions 
                            <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-right" role="menu" id= "nav_ul" style="position: relative !important;">
                            <li>
                                <a data-batch-action="true" data-toggle="modal" data-target="#snapshot" class="data-table-action control" name='{sv.name}' id="snapshot_{item.id}" type="submit" data-backdrop="false"> Create Snapshot</a>
                            </li>
                            <li>
                                <a data-batch-action="true" class="data-table-action control" name="{sv.name}" id="del_{item.id}" type="submit"> Delete Instance</a>
                            </li>
                            {console}
                            <li>
                                <a data-batch-action="true" class="data-table-action control" name="{sv.name}" id="reboot_{item.id}" type="submit"> Reboot Instance</a>
                            </li>
                            <li>
                                <a data-batch-action="true" class="data-table-action control" name="{sv.name}" id="stop_{item.id}" type="submit"> Stop Instance</a>
                            </li>
                        </ul>
                    </div>
                    '''.format(sv=sv, item=item, console=console)
                elif item.status == 'SHUTOFF':
                    status = '<span class="label label-danger">%s</span>' % item.status
                    actions = '''
                    <div class='nav-item'>
                        <button type="button" class="btn btn-primary dropdown-toggle nav-link" data-toggle="dropdown">
                            Actions <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-right" role="menu" id= "nav_ul" style="position: relative !important;">
                            <li>
                                <a data-batch-action="true" class="data-table-action control" name="{sv.name}" id="del_{item.id}" type="submit"> Delete Instance</a>
                            </li>
                            <li>
                                <a data-batch-action="true" data-toggle="modal" data-target="#snapshot" class="data-table-action control" name="{sv.name}" id="snapshot_{item.id}" type="submit" data-backdrop="false"> Create Snapshot</a>
                            </li>
                            <li>
                                <a data-batch-action="true" class="data-table-action control" name="{sv.name}" id="start_{item.id}" type="submit"> Start Instance</a>
                            </li>
                        </ul>
                    </div>
                    '''.format(sv=sv, item=item)
                elif item.status == 'BUILD':
                    status = '<p>BUILD</p><div class="progress">' \
                             '<div class="progress-bar progress-bar-striped' \
                             ' progress-bar-animated active" style="width:100%"></div></div>'
                    actions = '''
                    <div class='nav-item'>
                        <button type="button" class="btn btn-primary dropdown-toggle nav-link" data-toggle="dropdown">
                            Actions <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-right" role="menu" id= "nav_ul" style="position: relative !important;">
                            <li>
                                <a data-batch-action="true" class="data-table-action control" name="{sv.name}" id="del_{item.id}" type="submit"> Delete Instance</a>
                            </li>
                        </ul>
                    </div>
                    '''.format(sv=sv, item=item)
                else:
                    status = '<span class="label label-danger">%s</span>' % item.status
                    actions = '''
                    <div class='nav-item'>
                        <button type="button" class="btn btn-primary dropdown-toggle nav-link" data-toggle="dropdown">
                        Actions <span class="caret"></span></button>
                        <ul class="dropdown-menu dropdown-menu-right" role="menu" id= "nav_ul" style="position: relative !important;">
                            <li>
                                <a data-batch-action="true" class="data-table-action control" name="{sv.name}" id="del_{item.id}" type="submit"> Delete Instance</a>
                            </li>
                        </ul>
                    </div>
                    '''.format(sv=sv, item=item)
            except Exception as e:
                ip = '<p></p>'
                status = '<p>BUILD</p><div class="progress"><div class="progress-bar progress-bar-striped progress-bar-animated active" style="width:100%"></div></div>'
                actions = ''
        except Exception as e:
            ip = '<p></p>'
            status = '''
            <p>BUILD</p>
            <div class="progress">
                <div class="progress-bar progress-bar-striped progress-bar-animated active" style="width:100%"></div>
            </div>
            '''
            actions = '<p><p>'
        if sv.i_d is not None:
            name = '''<a href="/client/show_instances/{sv.i_d}"><p>{sv.name}</p></a>'''.format(sv=sv)
        else:
            name = '<p>' + sv.name + '</p>'
        created = '<p>' + str(sv.created)[:-10] + '</p>'
        html += '''
        <tr>
            <td>{name}</td>
            <td>{sv.os_name}</td>
            <td>{ip}</td>
            <td>{sv.data_center}</td>
            <td>{status}</td>
            <td>{created}</td>
            <td>{actions}</td>
        </tr>
        '''.format(name=name, ip=ip, status=status, created=created, actions=actions, sv=sv)

    return HttpResponse(html)


@login_require
@client_only
def sshkeys(request, option):
    user = request.user
    if request.method == "POST":
        if 'sshkeyname' in request.POST:
            try:
                Sshkeys.objects.get(name=request.POST['sshkeyname'])
                return HttpResponse('Tên ssh key đã tồn tại!')
            except Exception as e:
                logger.error(e)
            connect = NovaClient(token=user.token_id, project_name=user.username)
            sshkeyname = request.POST['sshkeyname']
            try:
                key = connect.create_sshkey(sshkeyname=sshkeyname)
            except Exception as e:
                logger.error(e)
                return HttpResponse("Đã có lỗi xảy ra!")
            mail_subject = 'Thông tin key pair: ' + sshkeyname
            message = render_to_string('client/send_info_key.html', {
                'user': user,
                'public_key': key.public_key,
                'key_name': key.name
            })
            to_email = user.email
            attaches = {
                'private.pem': key.private_key,
                'private.txt': key.private_key
            }
            send_email(mail_subject, message, to_email, attaches)
            Sshkeys.objects.create(ops=Ops.objects.all()[0], name=sshkeyname, owner=user)
        elif 'delete_sshkey' in request.POST:
            try:
                Sshkeys.objects.get(id=request.POST['id'])
            except ObjectDoesNotExist:
                return JsonResponse({"status": "Failure", "messages": 'ssh key không tồn tại!'})
            connect = NovaClient(token=user.token_id, project_name=user.username)
            sshkeyname = request.POST['delete_sshkey']
            try:
                connect.delete_sshkey(sshkeyname=sshkeyname)
                Sshkeys.objects.get(name=request.POST['delete_sshkey']).delete()
            except Exception as e:
                logger.error(e)
                return JsonResponse({"status": "Failure", "messages": 'ssh key không tồn tại!'})
            else:
                return JsonResponse({"status": "Success", "messages": 'Thành công'})
    ls_key = Sshkeys.objects.filter(owner=user)
    return render(request, 'client/sshkeys.html', {'ls_key': ls_key, 'option': option})


@login_require
@client_only
def setup(request):
    user = request.user
    if request.method == "POST":
        svname = request.POST['svname']
        ops = Ops.objects.all()[0]

        # check private network
        private_network = request.POST['private_network']
        if private_network == '1':
            private_network = user.username

        # check ssh key
        if request.POST['sshkey'].replace(" ", "") != 'Không':
            sshkey = request.POST['sshkey']
        else:
            sshkey = None

        # check os
        try:
            o_s = request.POST['os']
            root_pass = 'Cloud@intercom'
        except Exception as e:
            logger.error(e)
            o_s = None
            root_pass = binascii.hexlify(os.urandom(8)).decode("utf-8")
            cloudinit = "#cloud-config\npassword: " + root_pass + "\nssh_pwauth: True\nchpasswd:\n expire: false"

        # số lượng vm
        count = 1
        connect_neutron = NeutronClient(admin=True)
        connect_admin_nova = NovaClient(admin=True)
        connect = NovaClient(token=user.token_id, project_name=user.username)

        # check flavor
        ram = int(int(request.POST['ram']) * 1024)
        vcpus = int(request.POST['vcpus'])
        # disk = int(request.POST['disk'])
        disk = int(int(request.POST['disk'])/10)

        flavor = [ram, vcpus, disk]
        if [ram, vcpus, disk] not in connect.list_flavor():
            connect_admin_nova.createFlavor(svname=svname, ram=ram, vcpus=vcpus, disk=disk)
            check = False
            while not check:
                if connect.find_flavor(ram=ram, vcpus=vcpus, disk=disk):
                    check = True

        # tính giá tiền
        price = 0
        type_disk = request.POST['type_disk']
        ops_price = Prices.objects.all()[0]

        if type_disk == ops.disk_hdd:
            price = (int(request.POST['ram']) * ops_price.ram + vcpus * ops_price.vcpus + disk * ops_price.disk_hdd) \
                    * count * 1.1
        elif type_disk == ops.disk_ssd:
            price = (int(request.POST['ram']) * ops_price.ram + vcpus * ops_price.vcpus + disk * ops_price.disk_ssd) \
                    * count * 1.1

        if user.is_trial:
            if Server.objects.filter(owner=user).count() > 0:
                return JsonResponse({'status': 'Failure',
                                     'message': 'Tài khoản dùng thử chỉ được tạo 1 máy chủ'})
            if ram > 1024 or vcpus > 1 or disk > 10:
                return JsonResponse({'status': 'Failure',
                                     'message': 'Tài khoản dùng thử chỉ được tạo máy chủ với cấu hình tối thiểu'})
        else:
            if float(user.money) < price:
                return JsonResponse({'status': 'Failure', 'message': 'Tài khoản không đủ tiền'})

        # check tên vm
        try:
            Server.objects.get(name=svname, owner=user)
        except ObjectDoesNotExist:
            pass
        else:
            return JsonResponse({'status': 'Failure', 'message': 'Tên server bị trùng!'})

        # lấy image
        image = request.POST['image']
        try:
            im = connect.find_image(image)
            # im = connect.find_image('cirros')
        except Exception as e:
            logger.error(e)
            return JsonResponse({'status': 'Failure', 'message': "Hệ điều hành bị lỗi"})

        # lấy ip public
        net = ''
        for network in json.loads(ops.net_provider):
            try:
                ip_net = connect.find_network(network)
            except Exception as e:
                logger.error(e)
                logger.error('Network not found')
                return JsonResponse({'status': 'Failure', 'message': "Network bị lỗi"})
            if connect_neutron.free_ips(ip_net=ip_net) > 2:
                net = ip_net
                break
        if net == '':
            logger.error('No IP availability!')
            return JsonResponse({'status': 'Failure', 'message': "Không đủ IP"})

        # check dung lượng disk > dung lượng volume
        try:
            volume_size = im.block_device_mapping.split('"volume_size": ')[1].split('}]')[0]
            if disk < volume_size:
                return JsonResponse({'status': 'Failure',
                                     'message': "Dung lượng disk không được nhỏ hơn " + volume_size})
        except Exception as e:
            logger.error(e)
        if o_s is None:
            x = create_server.delay(type_disk=type_disk, flavor=flavor, image=image, svname=svname,
                                    private_network=private_network, count=count, user=user.username,
                                    root_pass=root_pass, price=price, o_s=o_s, cloudinit=cloudinit, sshkey=sshkey)
        else:
            x = create_server.delay(type_disk=type_disk, flavor=flavor, image=image, svname=svname,
                                    private_network=private_network, count=count, user=user.username,
                                    root_pass=root_pass, price=price, o_s=o_s)
        try:
            im_name = Images.objects.get(i_d=image).name
        except ObjectDoesNotExist:
            try:
                im_name = Snapshot.objects.get(i_d=image).name
            except ObjectDoesNotExist:
                im_name = 'Không xác định'
        Server.objects.create(project=user.username, description='test', name=svname, ram=ram, vcpus=vcpus,
                              disk=disk, owner=user, os_name=im_name,
                              data_center=request.POST['data_center'])
        return JsonResponse({'status': 'success', 'message': x.id})

    return render(request, 'client/setup.html', {'content': user.username,
                                                 'price': Prices.objects.all()[0],
                                                 'user_server': Server.objects.filter(owner=user).count(),
                                                 'snapshot': Snapshot.objects.filter(owner=user),
                                                 'ls_key': Sshkeys.objects.filter(owner=user),
                                                 'centos': Images.objects.filter(os__contains='centos'),
                                                 'debian': Images.objects.filter(os__contains='debian'),
                                                 'fedora': Images.objects.filter(os__contains='fedora'),
                                                 'windows': Images.objects.filter(os__contains='window'),
                                                 'ubuntu': Images.objects.filter(os__contains='ubuntu')})


@login_require
@client_only
def checkout(request):
    user = request.user
    return render(request, 'client/checkout.html', {'content': user.username,
                                                    'orders': Oders.objects.filter(owner=user)})


# Checkout
def nations_states(request):
    if request.user.is_authenticated:
        json_data = open('superadmin/static/data/data-nations-states.json')
        data = json.load(json_data)
        return JsonResponse(data, safe=False)
    return redirect('client:login')


# Lấy data timezone từ file json 
def user_timezone(request):
    if request.user.is_authenticated:
        json_data = open('superadmin/static/data/timezone.json')
        data = json.load(json_data)
        return JsonResponse(data, safe=False)
    return redirect('client:login')


# Data user json
def data_user_json(request):
    data = {}
    if request.user.is_authenticated:
        user = MyUser.objects.get(id=request.user.id)
        data.update({'id': user.id})
        data.update({'lastname': user.lastname})
        data.update({'firstname': user.firstname})
        data.update({'email': user.email})
        data.update({'phone': user.phone})
        data.update({'company': user.company})
        data.update({'address_register': user.addressRegister})
        data.update({'director': user.director})
        data.update({'tax_id': user.taxID})
        data.update({'address1': user.address1})
        data.update({'country': user.country})
        data.update({'city': user.city})
        data.update({'region': user.region})
        data.update({'timezone': user.timezone})
        data.update({'address2': user.address2})
        data.update({'post_code': user.postCode})

    return JsonResponse(data, safe=False)


@login_require
@client_only
def update_user(request):
    if request.method == 'POST':
        current_user = request.user
        if 'pass1' in request.POST:
            if check_password(request.POST['pass1'], current_user.password):
                current_user.set_password(request.POST['pass2'])
                current_user.save()
                return JsonResponse({"status": "Done", "messages": reverse('client:login')})
            else:
                return JsonResponse({"status": "Failure", "messages": 'Mật khẩu không đúng'})
        else:
            current_user.lastname = request.POST['lastname']
            current_user.firstname = request.POST['firstname']
            current_user.phone = request.POST['phone']
            current_user.company = request.POST['company_name']
            current_user.addressRegister = request.POST['addressRegister']
            current_user.director = request.POST['director']
            current_user.taxID = request.POST['tax_id']
            current_user.address1 = request.POST['address1']
            current_user.country = request.POST['country']
            current_user.city = request.POST['city']
            current_user.region = request.POST['region']
            current_user.timezone = request.POST['timezone']
            current_user.address2 = request.POST['address2']
            current_user.postCode = request.POST['postcode']
            current_user.save()
            return JsonResponse({"status": "Done", "messages": reverse('client:login')})

