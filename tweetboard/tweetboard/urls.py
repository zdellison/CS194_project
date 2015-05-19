from django.conf.urls import include, url
from django.contrib import admin

urlpatterns = [
    # Examples:
    # url(r'^$', 'tweetboard.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^login/', include('login.urls')),
    url(r'^dashboard/', include('dashboard.urls')),
    url(r'^admin/', include(admin.site.urls)),
]
