# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_auto_20150607_2334'),
    ]

    operations = [
        migrations.AddField(
            model_name='twitteruser',
            name='gender',
            field=models.CharField(default='unknown', max_length=20),
            preserve_default=False,
        ),
    ]
