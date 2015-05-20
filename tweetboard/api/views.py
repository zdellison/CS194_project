# Django
from django.shortcuts import render
from django.conf import settings
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate

# Project
from login.models import Profile

import tweepy as tp

@login_required
def init(request):
    profile = Profile.objects.get(pk=request.session['_auth_user_id'])

    auth = tp.OAuthHandler(settings.TWITTER_CONSUMER_KEY, settings.TWITTER_CONSUMER_SECRET)
    auth.set_access_token(profile.oauth_token, profile.oauth_secret)
    api = tp.API(auth)

    personal_info = api.me()
    response = {}
    response['twitterHandle'] = profile.user.username
    response['userLocation'] = personal_info.location
    response['userName'] = personal_info.name
    response['userPic'] = personal_info.profile_image_url

    recent_tweets = []

    tweets = api.user_timeline(count=25)

    for tweet in tweets:
	recent_tweets.append({
	    'tweetId': tweet.id,
	    'tweetBody': tweet.text
	})

    response['tweetsArray'] = recent_tweets

    return JsonResponse(response)
