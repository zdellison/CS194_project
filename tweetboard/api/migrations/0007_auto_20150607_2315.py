# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_auto_20150607_2312'),
    ]

    operations = [
        migrations.AlterField(
            model_name='retweet',
            name='user_data',
            field=models.ForeignKey(to='api.TwitterUser', null=True),
        ),
    ]
