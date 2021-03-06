# Generated by Django 2.1.7 on 2019-02-26 04:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('superadmin', '0006_prices'),
    ]

    operations = [
        migrations.AddField(
            model_name='ops',
            name='disk_hdd',
            field=models.CharField(default='ceph-hdd', max_length=50),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='ops',
            name='disk_ssd',
            field=models.CharField(default='ceph-ssd', max_length=50),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='ops',
            name='role_admin',
            field=models.CharField(default='admin', max_length=50),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='ops',
            name='role_user',
            field=models.CharField(default='user', max_length=50),
            preserve_default=False,
        ),
    ]
