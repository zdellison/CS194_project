# Django
from django.shortcuts import render
from django.conf import settings
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate

# Project
from login.models import Profile

import tweepy as tp
from textblob import TextBlob as tb

# ================================
# INTERNAL METHODS
# ================================

# Method returns an OAUTH authorized api instance from tweepy.py
def get_api_with_auth(request):
    profile = Profile.objects.get(pk=request.session['_auth_user_id'])

    auth = tp.OAuthHandler(settings.TWITTER_CONSUMER_KEY, settings.TWITTER_CONSUMER_SECRET)
    auth.set_access_token(profile.oauth_token, profile.oauth_secret)
    api = tp.API(auth)

    return api

# Method returns a dict of processed user data from a tweepy User instance
def get_user_info(user_id, api):
    user = {}
    user_resp = api.get_user(id = user_id)
    user['name'] = user_resp.name
    user['id'] = user_resp.id
    user['created_at'] = user_resp.created_at
    user['location'] = user_resp.location
    user['favourites_count'] = user_resp.favourites_count
    user['followers_count'] = user_resp.followers_count
    user['listed_count'] = user_resp.listed_count
    user['statuses_count'] = user_resp.statuses_count
    user['friends_count'] = user_resp.friends_count
    user['screen_name'] = user_resp.screen_name
#    user['gender'] = user_resp.gender
    return user

# Method returns a dict of processed tweet data from a tweepy status
def get_tweet_info(tweet):
    processed_tweet = {
            'tweetId': tweet.id,
            'created_by_id': tweet.user.id,
            'created_at': tweet.created_at,
            'favorited': tweet.favorited,
            'retweeted': tweet.retweeted,
            'text': tweet.text,
            'coordinates': tweet.coordinates
        }
    if 'hashtags' in tweet.entities:
        processed_tweet['hashtags'] = tweet.entities['hashtags']
    else:
        processed_tweet['hashtags'] = None
    if 'media' in tweet.entities:
        processed_tweet['media'] = tweet.entities['media']
    else: processed_tweet['media'] = None
    if tweet.retweeted:
        processed_tweet['retweet_count'] = tweet.retweet_count
    else: processed_tweet['retweet_count'] = 0   
    if tweet.favorited:
        processed_tweet['favorites_count'] = tweet.favorites_count
    else: processed_tweet['favorites_count'] = 0

    # Get Sentiment
    blob = tb(tweet.text)
    sentiment = {'polarity': blob.sentiment.polarity, 
            'subjectivity': blob.sentiment.subjectivity
            }
    processed_tweet['sentiment'] = sentiment

    return processed_tweet

# =========================
# PUBLIC URL-ROUTED METHODS
# =========================

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

def sample_users(request):
    response = {
        "users": [
            {
                "name": "Anna",
                "age": 21,
                "gender": "female"
            },
            {
                "name": "Pedro",
                "age": 22,
                "gender": "male"
            },
            {
                "name": "Paul",
                "age": 22,
                "gender": "male"
            },
            {
                "name": "Zach",
                "age": 22,
                "gender": "male"
            }
        ]}

    return JsonResponse(response)

@login_required
def get_tweets_by_user_id(request):
    api = get_api_with_auth(request)

    recent_tweets = []
    tweets = api.user_timeline(id=request.GET['user_id'],count=25,)
    for tweet in tweets:
        recent_tweets.append(get_tweet_info(tweet))

    response = {}
    response['tweets'] = recent_tweets

    return JsonResponse(response)

# Given a user, return all users who have retweeted their previous 10 tweets
@login_required
def get_users_retweet_by_original_user(request):
    api = get_api_with_auth(request)

    users = []
    retweeted_tweets = []
    tweets = api.user_timeline(id=request.GET['user_id'], count=10)
    for tweet in tweets:
        if tweet.retweet_count > 0:
            retweeted_tweets.append(tweet.id)
            retweets = api.retweets(tweet.id)
            for retweet in retweets:
                users.append(get_user_info(retweet.user.id, api))

    response = {'tweets':retweeted_tweets,'users':users}
    return JsonResponse(response)

# Return user info when given a user's Twitter id
@login_required
def get_user_by_id(request):
    api = get_api_with_auth(request)
    response = {'user': get_user_info(request.GET['user_id'], api)}
    return JsonResponse(response)


# Return tweet info when given tweet id
@login_required
def get_tweet_by_id(request):
    api = get_api_with_auth(request)

    tweet = {}
    t_resp = api.get_status(id = request.GET['tweet_id'])

    response = {'tweet': get_tweet_info(t_resp)}
    return JsonResponse(response)

# Given a Tweet ID, return user info about previous 100 users that retweeted it
@login_required
def get_retweet_user_info(request):
    api = get_api_with_auth(request)
    retweets = api.retweets(request.GET['tweet_id'])
    users = []
    retweet_ids = []
    for retweet in retweets:
        users.append(get_user_info(retweet.user.id, api))
        retweet_ids.append(retweet.id)

    response = {'users': users, 'retweets': retweet_ids}
    return JsonResponse(response)
