# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_auto_20150607_2315'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='retweet',
            name='created_by',
        ),
        migrations.RemoveField(
            model_name='retweet',
            name='gender',
        ),
        migrations.RemoveField(
            model_name='retweet',
            name='name',
        ),
        migrations.AddField(
            model_name='retweet',
            name='text',
            field=models.CharField(default='', max_length=200),
            preserve_default=False,
        ),
    ]
