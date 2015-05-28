# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Retweet',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_at', models.DateTimeField(editable=False)),
                ('gender', models.CharField(max_length=10)),
            ],
        ),
        migrations.CreateModel(
            name='Tweet',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_at', models.DateTimeField(editable=False, db_index=True)),
                ('created_by', models.CharField(max_length=50)),
                ('text', models.CharField(max_length=140)),
                ('tweet_id', models.CharField(max_length=50)),
                ('num_favorites', models.IntegerField()),
                ('num_retweets', models.IntegerField()),
                ('last_updated', models.DateTimeField()),
            ],
        ),
        migrations.AddField(
            model_name='retweet',
            name='tweet',
            field=models.ForeignKey(to='api.Tweet'),
        ),
    ]
