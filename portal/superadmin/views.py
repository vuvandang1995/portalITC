import json

from django.contrib.auth.hashers import check_password
from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse
from django.urls import reverse

from client.decorator import login_require, admin_only
from plugin.novaclient import NovaClient
from superadmin.models import *


@login_require
@admin_only
def home(request):
    ops = Ops.objects.all()[0]
    if request.method == 'POST':
        ops.name = request.POST['name']
        ops.ip = request.POST['ip']
        ops.username = request.POST['username']
        ops.password = request.POST['password']
        ops.project = request.POST['project']
        ops.userdomain = request.POST['userdomain']
        ops.projectdomain = request.POST['projectdomain']
        ops.disk_hdd = request.POST['disk_hdd']
        ops.disk_ssd = request.POST['disk_ssd']
        ops.role_admin = request.POST['role_admin']
        ops.role_user = request.POST['role_user']
        ops.net_provider = request.POST['net_provider']
        ops.save()
        return JsonResponse({"status": "Done", "messages": "Thành công"})
    net_provider = json.loads(ops.net_provider)
    return render(request, 'kvmvdi/home.html', {'ops': ops,
                                                'net_provider': net_provider,
                                                'json': json.dumps(net_provider)})


@login_require
@admin_only
def images(request):
    if request.method == 'POST':
        ops = Ops.objects.all()[0]
        connect = NovaClient(admin=True)
        Images.objects.all().delete()
        im = connect.list_Images()
        while True:
            try:
                image = im.__next__()
                if image['visibility'] == 'public':
                    try:
                        Images.objects.create(ops=ops, name=image['name'], os=image['mdt_os_name'], i_d=image.id)
                    except:
                        Images.objects.create(ops=ops, name=image['name'], os='other', i_d=image.id)
            except StopIteration:
                break
        return JsonResponse({"status": "Done", "messages": "Thành công"})
    return render(request, 'kvmvdi/images.html', {'images': Images.objects.all()})


@login_require
@admin_only
def prices(request):
    price = Prices.objects.all()[0]
    if request.method == 'POST':
        price.ram = request.POST['ram']
        price.vcpus = request.POST['vcpus']
        price.disk_hdd = request.POST['disk_hdd']
        price.disk_ssd = request.POST['disk_ssd']
        price.save()
        return JsonResponse({"status": "Done", "messages": "Thành công"})
    return render(request, 'kvmvdi/prices.html', {'price': price})


@login_require
@admin_only
def user_profile(request):
    if request.method == 'POST':
        user = request.user
        if check_password(request.POST['pass1'], user.password):
            user.set_password(request.POST['pass2'])
            user.save()
            return JsonResponse({"status": "Done", "messages": reverse('client:login')})
        else:
            return JsonResponse({"status": "Fail", "messages": 'Mật khẩu không đúng'})
    return render(request, 'kvmvdi/profile.html')


