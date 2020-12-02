from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    pass


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