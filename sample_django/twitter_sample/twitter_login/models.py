from django.db import models

# Create your models here.

class User(madels.Model):
    name = models.CharField(max_length=200)
    twitter_token = models.CharField(max_length=200)

