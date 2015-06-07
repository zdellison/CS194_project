# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_tweet_hashtags'),
    ]

    operations = [
        migrations.AddField(
            model_name='retweet',
            name='created_by',
            field=models.CharField(default='', max_length=50),
            preserve_default=False,
        ),
    ]
