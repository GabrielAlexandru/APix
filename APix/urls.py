from django.views.generic.base import RedirectView
from django.conf.urls import include, url

from . import views

urlpatterns = [
    url(r'logout/$', RedirectView.as_view(pattern_name='auth_login', permanent=True)),
    url(r'get-logged-users', views.get_logged_users, name='get-logged-users'),
    url(r'^', include('registration.backends.simple.urls')),
    url(r'^$', views.index, name='home'),
    url(r'draw-mobile', views.mobile_draw, name='m.draw'),
    url(r'draw', views.draw, name='draw'),
    url(r'documentation', views.documentation, name='documentation'),
]
