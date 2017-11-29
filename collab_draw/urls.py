from django.views.generic.base import RedirectView
from django.conf.urls.static import static
from django.conf.urls import include, url
from django.contrib import admin
from django.conf import settings

urlpatterns = [
                  url(r'^apix/', include('APix.urls')),
                  url(r'^admin/', admin.site.urls),
                  url(r'^$', RedirectView.as_view(pattern_name='home', permanent=False))
              ] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
