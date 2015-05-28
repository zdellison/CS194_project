# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='retweet',
            name='retweet_id',
            field=models.CharField(default=datetime.datetime(2015, 5, 27, 23, 1, 13, 598198, tzinfo=utc), max_length=50),
            preserve_default=False,
        ),
    ]
