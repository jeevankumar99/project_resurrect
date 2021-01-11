from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    balance = models.DecimalField(decimal_places=2, default=25000, max_digits=20)
    profits = models.DecimalField(decimal_places=2, max_digits=20, default=0)
    losses = models.DecimalField(decimal_places=2, max_digits=20, default=0)
    total_investment = models.DecimalField(decimal_places=2, max_digits=20, default=0)

    def serialize(self):
        return {
            'username': self.username,
            'balance': self.balance,
            'profits': self.profits,
            'losses': self.losses,
            'total_investment': self.total_investment
        }

class Portfolio(models.Model):
    stock_symbol = models.CharField(blank=False, max_length=12)
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="portfolio_user")
    quantity = models.PositiveIntegerField(blank=False)
    total_spent = models.DecimalField(decimal_places=2, blank=False, default=0, max_digits=20)

    def __str__(self):
        return (f'{self.user.username} has {self.quantity} {self.stock_symbol} stocks')

    def serialize(self):
        return {
            'symbol': self.stock_symbol,
            'quantity': self.quantity,
            'totalSpent': self.total_spent,
        }


class Transaction(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="transaction_user")
    transaction_type = models.CharField(blank=False, default='buy', max_length=4)
    stock_symbol = models.CharField(blank=False, max_length=12)
    long_name = models.CharField(blank=False, max_length=100)
    quantity = models.PositiveIntegerField(blank=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    price_at_purchase = models.DecimalField(decimal_places=2, blank=False, max_digits=15)

    def __str__(self):
        return (f'{self.user.username} bought {self.quantity} {self.stock_symbol} at {self.price_at_purchase}')

    def serialize(self):
        print(self.timestamp)
        return {
            'transactionID': self.id,
            'symbol': self.stock_symbol,
            'longName': self.long_name,
            'quantity': self.quantity,
            'timestamp': self.timestamp.strftime("%a, %d %b %y, %I:%M %p"),
            'priceAtPurchase': self.price_at_purchase,
            'transactionType': self.transaction_type
        }


class Watchlist(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="watchlist_user")
    stock_symbol = models.CharField(blank=False, max_length=12)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (f'{self.user.username}-{self.stock_symbol}')

    def serialize(self):
        return {
            'symbol': self.stock_symbol,
            'timestamp': self.timestamp.strftime("%d/%m/%y %H:%M")
        }

