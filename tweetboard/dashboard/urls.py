from django.conf.urls import url, include
from django.contrib import admin

from dashboard.views import *

urlpatterns = [
    url(r'^$', index, name='index'),
]
