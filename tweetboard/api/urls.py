from django.conf.urls import url, include
from django.contrib import admin

from api.views import *

urlpatterns = [
    url(r'init', init),
    url(r'get_tweets_by_user_id', get_tweets_by_user_id),
    url(r'get_users_retweet_by_original_user', get_users_retweet_by_original_user),
    url(r'get_user_by_id', get_user_by_id),
    url(r'get_tweet_by_id', get_tweet_by_id),
    url(r'get_retweet_user_info', get_retweet_user_info),
    url(r'get_gender_total_for_recent_tweets', get_gender_total_for_recent_tweets),
]
