# Generated by Django 3.1.4 on 2020-12-24 15:01

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('stock', '0006_auto_20201222_1851'),
    ]

    operations = [
        migrations.RenameField(
            model_name='transaction',
            old_name='current_price',
            new_name='price_at_purchase',
        ),
    ]
