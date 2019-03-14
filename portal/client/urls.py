
from django.conf.urls import include, url
from django.urls import path
from client import views

app_name = 'client'
urlpatterns = [
    path('', views.user_login, name='login'),

    # Kích hoạt tài khoản email
    url(r'^activate/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$', views.activate, name='activate'),

    # Đặt lại mật khẩu
    url(r'^resetpassword/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$', views.resetpwd, name='resetpassword'),

    path('logout', views.user_logout, name='logout'),

    path('home', views.home, name='home'),

    path('home_data', views.home_data, name='home_data'),

    path('sshkeys<str:option>', views.sshkeys, name='sshkeys'),

    path('setup', views.setup, name='setup'),

    path('checkout', views.checkout, name='checkout'),

    # Dữ liệu các quốc gia và region dạng json
    path('json-nations-states', views.nations_states),

    # Dữ liệu timezone dạng json
    path('timezone', views.user_timezone),

    # Dữ liệu người dùng hiện tại dạng json
    path('data-user-json', views.data_user_json),

    # Nhận dữ liệu được push bằng ajax và update users
    path('post-data-user', views.update_user)

]