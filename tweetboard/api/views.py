#Django
from django.shortcuts import render
from django.conf import settings
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate

# Project
from login.models import Profile

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

def get_gender(user):
    first_name = user.name.split(' ', 1)[0]
    if re.match('[A-Za-z]+', first_name):
        return detector.guess(first_name)
    else: return 'unknown'

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
    user['profile_image_url'] = user_resp.profile_image_url

   # Get gender:
    user['gender'] = get_gender(user_resp)
    
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

    recent_tweets = []

    tweets = api.user_timeline(count=25)

    for tweet in tweets:
	recent_tweets.append({
	    'tweetId': tweet.id,
	    'tweetBody': tweet.text
	})

    response['tweetsArray'] = recent_tweets

    return JsonResponse(response)

@login_required
def get_tweets_by_user_id(request):
    api = get_api_with_auth(request)

    recent_tweets = []
    tweets = api.user_timeline(id=request.GET['user_id'], count=25)
    for tweet in tweets:
        recent_tweets.append(get_tweet_info(tweet))

    response = {}
    response['tweets'] = recent_tweets

    return JsonResponse(response)

# Given a user, return all users who have retweeted their previous 10 tweets
# NOTE: Don't use this, it burns through rate limiting and was only an example
@login_required
def get_users_retweet_by_original_user(request):
    api = get_api_with_auth(request)

    users = []
    retweeted_tweets = []
    tweets = api.user_timeline(id=request.GET['user_id'], count=10)
    for tweet in tweets:
        if tweet.retweet_count > 0:
            retweeted_tweets.append(tweet.id)
            retweets = api.retweets(tweet.id, count=100)
            for retweet in retweets:
                users.append(get_user_info(retweet.user.id, api))

    response = {'tweets':retweeted_tweets,'users':users}
    return JsonResponse(response)

# Return user info when given a user's Twitter ID
@login_required
def get_user_by_id(request):
    api = get_api_with_auth(request)
    response = {'user': get_user_info(request.GET['user_id'], api)}
    return JsonResponse(response)


# Return tweet info when given Tweet ID
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
    tweet = api.get_status(id = request.GET['tweet_id'])
    retweets = api.retweets(request.GET['tweet_id'], count=100)
    users = []
    retweet_ids = []
    created_at = []
    user_ids = []
    for retweet in retweets:
        user = get_user_info(retweet.user.id, api)
        friendship = api.show_friendship(source_id=user['id'], target_id=tweet.user.id)[0]
        user['following_candidate'] = friendship.following
        user['followed_by_candidate'] = friendship.followed_by
        users.append(user)
        retweet_ids.append(retweet.id)
        created_at.append(retweet.created_at)

    response = {'users': users, 'retweets': retweet_ids, 'created_at': created_at}
    return JsonResponse(response)

# Given User ID, for the last 25 tweets, how many of the users that retweeted
# were male, female or unknown.
@login_required
def get_gender_total_for_recent_tweets(request):
    api = get_api_with_auth(request)

    gender_totals = {
            'male': 0,
            'female': 0,
            'unknown': 0,
            }
    retweet_count = 0
    total_retweets = 0
    # Set to 10 for now to prevent hitting rate limit as much...
    # TODO: Switch back to 25 once Paul has integrated DB
    tweets = api.user_timeline(id=request.GET['user_id'], count=10)
    for tweet in tweets:
        retweets = api.retweets(tweet.id, count=100)
        total_retweets += tweet.retweet_count
        for retweet in retweets:
            retweet_count += 1
            user = retweet.author
            gender_totals[get_gender(user)] += 1

    response = {
            'gender_totals': gender_totals,
            'retweet_count': retweet_count,
            'total_retweets': total_retweets,
            }
    return JsonResponse(response)



