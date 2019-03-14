from django.conf.urls import url
from django.urls import path
from . import consumers

websocket_urlpatterns = [
    url(r'^ws/(?P<admin_name>[^/]+)/$', consumers.AdminConsumer),
]