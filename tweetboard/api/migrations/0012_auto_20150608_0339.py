# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0011_place_initialized'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='place_tweet',
            name='negative',
        ),
        migrations.RemoveField(
            model_name='place_tweet',
            name='positive',
        ),
    ]
