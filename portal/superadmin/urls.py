from django.conf.urls import include, url
from django.urls import path
from . import views

app_name = 'superadmin'

urlpatterns = [
    path('home', views.home, name='home'),
    path('images', views.images, name='images'),
    path('prices', views.prices, name='prices'),
    path('profile/', views.user_profile, name='profile'),
]