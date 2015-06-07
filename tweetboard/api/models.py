from django.db import models
from textblob import TextBlob as tb
from gender_detector import GenderDetector as gd
import datetime
import thread
import json
from django.utils.timezone import utc

detector = gd('us')
def get_gender(name):
    first_name = name.split(' ', 1)[0]
    if re.match('[A-Za-z]+', first_name):
        return detector.guess(first_name)
    else: return 'unknown'

# Create your models here.
class Tweet(models.Model):
    created_at = models.DateTimeField(editable=False, db_index=True)
    created_by = models.CharField(max_length=50)
    text = models.CharField(max_length=140)
    tweet_id = models.CharField(max_length=50)
    hashtags = models.CharField(max_length=200)
    num_favorites = models.IntegerField()
    num_retweets = models.IntegerField()
    last_updated = models.DateTimeField()

    def save(self, *args, **kwargs):
        self.last_updated = datetime.datetime.today().replace(tzinfo=utc)
        return super(Tweet, self).save(*args, **kwargs)

    def to_obj(self):
	obj = {
	    'tweet_id': self.tweet_id,
            'created_by_id': self.created_by,
            'created_at': self.created_at,
            'text': self.text,
            'favorite_count': self.num_favorites,
            'retweet_count': self.num_retweets,
	}
	### Hashtags
	obj['hashtags'] = json.loads(self.hashtags)
	blob = tb(self.text)
	sentiment = {
	    'polarity': blob.sentiment.polarity,
	    'subjectivity': blob.sentiment.subjectivity
	}
	obj['sentiment'] = sentiment
	return obj

    @staticmethod
    def get_recent_tweets(api, uid, cnt):
	recent_tweets = api.user_timeline(id=uid, count=cnt)
	tweets = []
	to_update = []
	for tweet in recent_tweets:
	    print tweet.text
	    # Check if Tweet already exists
	    existing = Tweet.objects.filter(tweet_id=tweet.id)
	    if len(existing) == 1:
		tweet_obj = existing[0]
	    else:
		# Create new one if we need to
		tweet_obj = Tweet()
		tweet_obj.created_at = tweet.created_at.replace(tzinfo=utc)
		tweet_obj.created_by = uid
		tweet_obj.text = tweet.text
		tweet_obj.tweet_id = tweet.id
		hashtags = []
		for ht in tweet.entities['hashtags']:
		    hashtags.append(ht['text'])
		tweet_obj.hashtags = json.dumps(hashtags)


	    # Update these fields
	    tweet_obj.num_favorites = tweet.favorite_count
	    tweet_obj.num_retweets = tweet.retweet_count

	    # Tweet creation time = a
	    # Last updated time = b
	    # Now = c
	    # We update if (c - b) > (b - a) or if it's new
	    should_update = True
	    now = datetime.datetime.utcnow().replace(tzinfo=utc)
	    if tweet_obj.last_updated is not None:
		time_to_update = (tweet_obj.last_updated - tweet_obj.created_at).total_seconds()
		since_update = (now - tweet_obj.last_updated).total_seconds()
		if since_update < time_to_update:
		    should_update = False

	    # Save so it's in the database for the retweets
	    tweet_obj.last_updated = now
	    tweet_obj.save()

	    # Update
	    if should_update:
		to_update.append(tweet_obj)

	    # Add to list
	    tweets.append(tweet_obj.to_obj())

	def refetch():
	    for t in to_update:
		t.fetch_retweets(api, uid)

	thread.start_new_thread(refetch, ())

	return tweets

    def fetch_retweets(self, api, uid):
	try:
	    retweets = api.retweets(self.tweet_id, 100)
	except Exception, e:
	    print str(e)
	    return

	for rt in retweets:
	    existing = Retweet.objects.filter(retweet_id=rt.id)
	    if len(existing) == 0:
		rt_obj = Retweet()
		rt_obj.tweet = self
		rt_obj.retweet_id = rt.id
		rt_obj.created_at = rt.created_at.replace(tzinfo=utc)
		rt_obj.make_user_data(rt.user)
		rt_obj.text = rt.text
		rt_obj.save()

	self.last_updated = datetime.datetime.utcnow().replace(tzinfo=utc)
	self.save()

    @staticmethod
    def remove_old_tweets_for_user_id(uid, num_to_keep):
	old_tweets = Tweet.objects.filter(created_by=uid).order_by('-created_at')[num_to_keep:]
	for t in old_tweets:
	    for rt in Retweet.objects.filter(tweet_id=t.id):
		rt.delete()
	    t.delete()

class TwitterUser(models.Model):
    name = models.CharField(max_length=50)
    user_id = models.CharField(max_length=100)
    created_at = models.DateTimeField()
    num_favorites = models.IntegerField()
    num_followers = models.IntegerField()
    num_tweets = models.IntegerField()
    num_friends = models.IntegerField()
    screen_name = models.CharField(max_length=100)

    def to_obj(self):
	obj = {}
	obj['name'] = self.name
	obj['id'] = self.user_id
	obj['created_at'] = self.created_at
	#obj['location'] = self.
	obj['favourites_count'] = self.num_favorites
	obj['followers_count'] = self.num_followers
	obj['statuses_count'] = self.num_tweets
	obj['friends_count'] = self.num_friends
	obj['screen_name'] = self.screen_name
	obj['gender'] = get_gender(self.name)

	return obj


class Retweet(models.Model):
    tweet = models.ForeignKey(Tweet)
    retweet_id = models.CharField(max_length=50)
    created_at = models.DateTimeField(editable=False)
    user_data = models.ForeignKey(TwitterUser, null=True)
    text = models.CharField(max_length=200)

    def make_user_data(self, user):
	u = TwitterUser()
	u.name = user.name
	u.user_id = user.id
	u.created_at = user.created_at
	u.num_favorites = user.favourites_count
	u.num_followers = user.followers_count
	u.num_tweets = user.statuses_count
	u.num_friends = user.friends_count
	u.screen_name = user.screen_name
	u.save()
	self.user_data = u

    def delete(self):
	self.user_data.delete()
        return super(Retweet, self).delete()
