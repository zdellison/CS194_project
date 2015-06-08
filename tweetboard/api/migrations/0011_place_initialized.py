# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_auto_20150608_0237'),
    ]

    operations = [
        migrations.AddField(
            model_name='place',
            name='initialized',
            field=models.BooleanField(default=False),
        ),
    ]
