# Generated by Django 3.1.4 on 2021-01-11 07:39

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('stock', '0012_user_total_spent'),
    ]

    operations = [
        migrations.RenameField(
            model_name='user',
            old_name='total_spent',
            new_name='total_investment',
        ),
    ]
