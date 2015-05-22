from django.conf.urls import include, url
from django.contrib import admin

urlpatterns = [
    # Examples:
    # url(r'^$', 'twitter_sample.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^twitter_login/', include('twitter_login.urls')),
    url(r'^admin/', include(admin.site.urls)),
]
