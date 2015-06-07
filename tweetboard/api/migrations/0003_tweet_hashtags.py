# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_retweet_retweet_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='tweet',
            name='hashtags',
            field=models.CharField(default='[]', max_length=200),
            preserve_default=False,
        ),
    ]
