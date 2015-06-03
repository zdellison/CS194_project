from django.conf.urls import url, include
from django.contrib import admin

from dashboard.views import *

urlpatterns = [
    url(r'^$', index, name='index'),
    url(r'vizit', vizit),
    url(r'^tweet/(?P<tweet_id>\d+)/',tweet),
 ]
