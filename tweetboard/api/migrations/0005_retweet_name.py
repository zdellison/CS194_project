# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_retweet_created_by'),
    ]

    operations = [
        migrations.AddField(
            model_name='retweet',
            name='name',
            field=models.CharField(default='Jane Doe', max_length=50),
            preserve_default=False,
        ),
    ]
