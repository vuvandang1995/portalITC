from django.http import HttpResponseRedirect, HttpResponse, JsonResponse,Http404 
from django.shortcuts import render, redirect

from log.log import logger
from plugin.keystoneclient import KeystoneClient

# def hp_authenticate(func):
#     def wrapper(request, *args, **kwargs):
#         user = request.user
#         if not user.is_authenticated:
#             return redirect(reverse('chung:login'))
#         elif user.is_authenticated and not user.hieu_pho:
#             return redirect(reverse('giao_vien:subject'))
#         return func(request, *args, **kwargs)
#     return wrapper


def login_require(func):
    def wrapper(request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated:
            return redirect('client:login')
        elif user.is_adminkvm:
            return func(request, *args, **kwargs)
        else:
            try:
                connect = KeystoneClient(admin=True)
                connect.keystone.tokens.validate(user.token_id)
            except Exception as e:
                logger.error(e)
                return redirect('client:login')
            return func(request, *args, **kwargs)
    return wrapper


def client_only(func):
    def wrapper(request, *args, **kwargs):
        user = request.user
        if user.is_adminkvm:
            return redirect('superadmin:home')
        return func(request, *args, **kwargs)
    return wrapper


def admin_only(func):
    def wrapper(request, *args, **kwargs):
        user = request.user
        if not user.is_adminkvm:
            return redirect('client:home')
        return func(request, *args, **kwargs)
    return wrapper
