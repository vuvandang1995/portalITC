# Generated by Django 2.1.7 on 2019-03-09 02:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('superadmin', '0014_auto_20190307_1537'),
    ]

    operations = [
        migrations.RenameField(
            model_name='myuser',
            old_name='token_expired',
            new_name='created',
        ),
        migrations.AddField(
            model_name='myuser',
            name='is_trial',
            field=models.BooleanField(default=True),
        ),
    ]