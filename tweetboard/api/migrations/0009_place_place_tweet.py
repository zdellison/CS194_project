# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_auto_20150607_2334'),
    ]

    operations = [
        migrations.CreateModel(
            name='Place',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=50)),
                ('place_id', models.IntegerField()),
                ('last_updated', models.DateTimeField()),
                ('candidate', models.CharField(max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='Place_Tweet',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('text', models.CharField(max_length=140)),
                ('num_retweets', models.IntegerField()),
                ('num_fav', models.IntegerField()),
                ('user_name', models.CharField(max_length=50)),
                ('user_screen_name', models.CharField(max_length=50)),
                ('user_num_followers', models.IntegerField()),
                ('question', models.BooleanField()),
                ('positive', models.BooleanField()),
                ('negative', models.BooleanField()),
                ('place', models.ForeignKey(to='api.Place')),
            ],
        ),
    ]
