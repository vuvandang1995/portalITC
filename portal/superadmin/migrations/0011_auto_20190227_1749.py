# Generated by Django 2.1.7 on 2019-02-27 10:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('superadmin', '0010_ops_net_provider'),
    ]

    operations = [
        migrations.AlterField(
            model_name='oders',
            name='created',
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]