# Generated by Django 3.1.4 on 2020-12-26 15:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('stock', '0007_auto_20201224_2031'),
    ]

    operations = [
        migrations.AddField(
            model_name='transaction',
            name='long_name',
            field=models.CharField(default='long-name', max_length=100),
            preserve_default=False,
        ),
    ]
