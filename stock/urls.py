from stock.views import watchlist_handler
from django.urls.conf import path
from . import views

urlpatterns = [
    path('', views.index, name="index"),
    path('login', views.login_view, name="login"),
    path('register', views.register_view, name="register"),
    path('logout', views.logout_view, name="logout"),
    path('my_profile', views.profile_view, name="profile"),
    path('watchlist_handler', views.watchlist_handler, name="watchlist_handler_add"),
    path('watchlist_handler/<str:symbol>', views.watchlist_handler, name="watchlist_handler_get"),
]
