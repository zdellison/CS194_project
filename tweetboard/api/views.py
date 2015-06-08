#Django
from django.shortcuts import render
from django.conf import settings
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate

# Project
from login.models import Profile
from api.models import Tweet, Retweet

import tweepy as tp
from textblob import TextBlob as tb
from gender_detector import GenderDetector as gd
import re

detector = gd('us')

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

def get_gender(name):
    first_name = name.split(' ', 1)[0]
    if re.match('[A-Za-z]+', first_name):
        return detector.guess(first_name)
    else: return 'unknown'

# Method returns a dict of processed user data from a tweepy User instance
def get_user_info(user_resp):
    user = {}
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
    user['profile_image_url'] = user_resp.profile_image_url

   # Get gender:
    user['gender'] = get_gender(user_resp.name)

    return user

# Method returns a dict of processed tweet data from a tweepy status
def get_tweet_info(tweet):
    processed_tweet = {
            'tweet_id': tweet.id_str,
            'created_by_id': tweet.user.id,
            'created_at': tweet.created_at,
            'text': tweet.text,
            'coordinates': tweet.coordinates,
            # Note: only returns a non-zero favorite_count for an original
            # tweet. We'd need to look up the original tweet itself to get
            # the favorite_count, which is possible.
            'favorite_count': tweet.favorite_count,
            'retweet_count': tweet.retweet_count
# This favorited field only tells us if we, the authenticated user have
# favorited this tweet, which isn't that helpful.
#            'favorited': tweet.favorited,
        }
    if 'hashtags' in tweet.entities:
        processed_tweet['hashtags'] = tweet.entities['hashtags']
    else:
        processed_tweet['hashtags'] = None
    if 'media' in tweet.entities:
        processed_tweet['media'] = tweet.entities['media']
    else: processed_tweet['media'] = None

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

    return JsonResponse(response)

@login_required
def get_tweets_by_user_id(request):
    api = get_api_with_auth(request)

    response = {}
    response['tweets'] = Tweet.get_recent_tweets(api, request.GET['user_id'], 25)

    return JsonResponse(response)

@login_required
def get_tweets_at_user_id(request):
    api = get_api_with_auth(request)

    recent_tweets = []
    query = '@' + str(request.GET['user_id'])
    tweets = api.search(q=query, rpp=100)
    for tweet in tweets:
        recent_tweets.append(get_tweet_info(tweet))

    response = {}
    response['tweets'] = recent_tweets

    return JsonResponse(response)


@login_required
def get_positive_tweets_at_user_id(request):
    api = get_api_with_auth(request)

    recent_tweets = []
    query = '@' + str(request.GET['user_id']) + ' :)'
    tweets = api.search(q=query, rpp=100)
    for tweet in tweets:
        recent_tweets.append({
            'tweet':get_tweet_info(tweet),
            'user': get_user_info(tweet.author),
            })

    response = {}
    response['tweets'] = recent_tweets

    return JsonResponse(response)

@login_required
def get_negative_tweets_at_user_id(request):
    api = get_api_with_auth(request)

    recent_tweets = []
    query = '@' + str(request.GET['user_id']) + ' :('
    tweets = api.search(q=query, rpp=100)
    for tweet in tweets:
        recent_tweets.append({
            'tweet':get_tweet_info(tweet),
            'user': get_user_info(tweet.author),
            })

    response = {}
    response['tweets'] = recent_tweets

    return JsonResponse(response)


@login_required
def get_question_tweets_at_user_id(request):
    api = get_api_with_auth(request)

    recent_tweets = []
    query = '@' + str(request.GET['user_id']) + ' ?'
    tweets = api.search(q=query, rpp=100)
    for tweet in tweets:
        recent_tweets.append({
            'tweet':get_tweet_info(tweet),
            'user': get_user_info(tweet.author),
            })

    response = {}
    response['tweets'] = recent_tweets

    return JsonResponse(response)


# Given a user, return all users who have retweeted their previous 10 tweets
# NOTE: Don't use this, it burns through rate limiting and was only an example
@login_required
def get_users_retweet_by_original_user(request):
    users = []
    retweeted_tweets = []
    tweets = Tweet.objects.filter(created_by=request.GET['user_id'])[:10]
    for tweet in tweets:
        if tweet.num_retweets > 0:
            retweeted_tweets.append(tweet.tweet_id)
            retweets = Retweet.objects.filter(tweet=tweet)
            for retweet in retweets:
                users.append(retweet.user_data.to_obj())

    response = {'tweets':retweeted_tweets,'users':users}
    return JsonResponse(response)

# Return user info when given a user's Twitter ID
@login_required
def get_user_by_id(request):
    api = get_api_with_auth(request)
    user = api.get_user(id=request.GET['user_id'])
    response = {'user': get_user_info(user)}
    return JsonResponse(response)

# Return tweet info when given Tweet ID
@login_required
def get_tweet_by_id(request):
    tweet = Tweet.objects.get(tweet_id=request.GET['tweet_id'])
    response = {'tweet': tweet.to_obj()}

    return JsonResponse(response)

# Given a Tweet ID, return user info about previous 100 users that retweeted it
@login_required
def get_retweet_user_info(request):
    tweet = Tweet.objects.get(tweet_id=request.GET['tweet_id'])
    retweets = Retweet.objects.filter(tweet=tweet)

    users = []
    for retweet in retweets:
        users.append({
            'user': retweet.user_data.to_obj()
	    # THIS IS THE TWEET INFO FOR THE ORIGINAL TWEET
            'retweet': get_tweet_info(tweet)
        })

    response = {'users': users}
    return JsonResponse(response)

# Given User ID, for the last 25 tweets, how many of the users that retweeted
# were male, female or unknown.
@login_required
def get_gender_total_for_recent_tweets(request):
    gender_totals = {
        'male': 0,
        'female': 0,
        'unknown': 0,
    }
    retweet_count = 0
    total_retweets = 0
    tweets = Tweet.objects.filter(tweet_id=request.GET['user_id'])
    for tweet in tweets:
	retweets = Retweet.objects.filter(tweet=tweet)
        total_retweets += tweet.num_retweets
        for retweet in retweets:
            retweet_count += 1
            gender_totals[get_gender(retweet.user_data.name)] += 1

    response = {
	'gender_totals': gender_totals,
	'retweet_count': retweet_count,
	'total_retweets': total_retweets,
    }
    return JsonResponse(response)


# Return a list of tweets at user_id from location given by query
@login_required
def get_place_tweets_at_user_id(request):
    api = get_api_with_auth(request)

    # First we need to get location ID
    loc = api.geo_search(query=request.GET['place'])[0]
    place = {'id': loc.id, 'name': loc.full_name}

    recent_tweets = []
    query = '@' + str(request.GET['user_id'])
    tweets = api.search(q=query, rpp=100, place=loc.id)
    for tweet in tweets:
        recent_tweets.append(get_tweet_info(tweet))

    response = {}
    response['tweets'] = recent_tweets
    response['place'] = place

    return JsonResponse(response)

