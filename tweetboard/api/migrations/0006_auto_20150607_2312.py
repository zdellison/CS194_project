# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_retweet_name'),
    ]

    operations = [
        migrations.CreateModel(
            name='TwitterUser',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=50)),
                ('user_id', models.CharField(max_length=100)),
                ('created_at', models.DateTimeField()),
                ('num_favorites', models.IntegerField()),
                ('num_followers', models.IntegerField()),
                ('num_tweets', models.IntegerField()),
                ('num_friends', models.IntegerField()),
                ('screen_name', models.CharField(max_length=100)),
            ],
        ),
        migrations.AddField(
            model_name='retweet',
            name='user_data',
            field=models.ForeignKey(default=None, to='api.TwitterUser', null=True),
            preserve_default=False,
        ),
    ]
