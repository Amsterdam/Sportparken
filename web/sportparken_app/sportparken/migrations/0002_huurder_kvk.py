# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-03-28 14:22
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sportparken', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='huurder',
            name='kvk',
            field=models.CharField(max_length=10, null=True),
        ),
    ]
