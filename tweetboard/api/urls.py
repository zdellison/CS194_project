from django.conf.urls import url, include
from django.contrib import admin

from api.views import *

urlpatterns = [
    url(r'init', init),
]