from django.db import models
import datetime

# Create your models here.
class Tweet(models.Model):
    created_at = models.DateTimeField(editable=False, db_index=True)
    created_by = models.CharField(max_length=50)
    text = models.CharField(max_length=140)
    tweet_id = models.CharField(max_length=50)
    num_favorites = models.IntegerField()
    num_retweets = models.IntegerField()
    last_updated = models.DateTimeField()

    def save(self, *args, **kwargs):
        self.last_updated = datetime.datetime.today()
        return super(Tweet, self).save(*args, **kwargs)

    @staticmethod
    def remove_old_tweets_for_user_id(uid, num_to_keep):
	old_tweets = Tweet.objects.filter(created_by=uid).order_by('-created_at')[num_to_keep:]
	for t in old_tweets:
	    for rt in Retweet.filter(tweet_id=t.id):
		rt.delete()
	    t.delete()


class Retweet(models.Model):
    tweet = models.ForeignKey(Tweet)
    retweet_id = models.CharField(max_length=50)
    created_at = models.DateTimeField(editable=False)
    # male/female/unknown
    gender = models.CharField(max_length=10)
