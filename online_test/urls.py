from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = [
    # Examples:
    # url(r'^$', 'online_test.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),
    url(r'^exam/', include('yaksh.urls', namespace='yaksh', app_name='yaksh')),
    url(r'^', include('social.apps.django_app.urls', namespace='social')),
    url(r'^api/', include('api.urls')),
    url(r'^o/', include('oauth2_provider.urls', namespace='oauth2_provider')),
]
