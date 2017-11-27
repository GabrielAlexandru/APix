from django.views.generic.base import RedirectView
from django.conf.urls import include, url

from . import views

urlpatterns = [
    url(r'logout/$', RedirectView.as_view(pattern_name='auth_login', permanent=True)),
    url(r'get_logged_users', views.get_logged_users, name='get_logged_users'),
    url(r'^', include('registration.backends.simple.urls')),
    url(r'^$', views.index, name='home'),
    url(r'draw', views.draw, name='draw'),
]
