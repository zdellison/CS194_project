# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_place_place_tweet'),
    ]

    operations = [
        migrations.AlterField(
            model_name='place',
            name='place_id',
            field=models.CharField(max_length=50),
        ),
    ]
