# Django
from django.shortcuts import render
from django.conf import settings
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate

# Project
from login.models import Profile

# import tweepy as tp

def get_api_with_auth(request):
    profile = Profile.objects.get(pk=request.session['_auth_user_id'])

    auth = tp.OAuthHandler(settings.TWITTER_CONSUMER_KEY, settings.TWITTER_CONSUMER_SECRET)
    auth.set_access_token(profile.oauth_token, profile.oauth_secret)
    api = tp.API(auth)

    return api


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
        processed_tweet = {
            'tweetId': tweet.id,
            'created_by_id': tweet.user.id,
            'created_at': tweet.created_at,
            'favorited': tweet.favorited,
            'retweet_count': tweet.retweet_count,
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
        if tweet.favorited:
            processed_tweet['favorites_count'] = tweet.favorites_count
        else: processed_tweet['favorites_count'] = 0

        recent_tweets.append(processed_tweet)


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
                users.append({
                    'user_id': retweet.user.id,
                    'name': retweet.user.name,
                    #'gender': retweet.user.gender,
                    'followers': retweet.user.followers_count,
                    'friends': retweet.user.friends_count,
                    'favorites': retweet.user.favourites_count,
                    'listed': retweet.user.listed_count
                })


    response = {'tweets':retweeted_tweets,'users':users}
    return JsonResponse(response)
                
