# Generated by Django 3.1.4 on 2020-12-26 16:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('stock', '0008_transaction_long_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='transaction',
            name='timestamp',
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]
