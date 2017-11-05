from django.contrib.auth import views as auth_views
from django.conf.urls import include, url
from django.contrib import admin

from . import views

urlpatterns = [
    url(r'get_logged_users', views.get_logged_users, name='get_logged_users'),
    url(r'', include('registration.backends.simple.urls')),
    url(r'^$', views.index, name='index'),
    url(r'draw', views.draw, name='draw'),
]
