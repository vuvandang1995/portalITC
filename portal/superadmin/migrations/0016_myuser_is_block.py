# Generated by Django 2.1.7 on 2019-03-09 02:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('superadmin', '0015_auto_20190309_0906'),
    ]

    operations = [
        migrations.AddField(
            model_name='myuser',
            name='is_block',
            field=models.BooleanField(default=False),
        ),
    ]
