# Generated by Django 3.1.4 on 2021-01-10 08:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('stock', '0011_transaction_transaction_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='total_spent',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=20),
        ),
    ]
