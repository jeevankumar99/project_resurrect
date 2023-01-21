from stock.views import watchlist_handler
from django.urls.conf import path
from . import views

urlpatterns = [
    path('', views.index, name="index"),
    path('login', views.login_view, name="login"),
    path('register', views.register_view, name="register"),
    path('logout', views.logout_view, name="logout"),
    path('my_profile', views.profile_view, name="my_profile"),
    path('watchlist_handler', views.watchlist_handler, name="watchlist_handler_add"),
    path('watchlist_handler/<str:symbol>', views.watchlist_handler, name="watchlist_handler_get"),
    path('my_watchlist', views.watchlist_view, name="my_watchlist"),
    path('get_watchlist', views.get_watchlist, name="get_watchlist"),
    path('stock/<str:symbol>', views.stock_view, name="stock_view"),
    path('get_user_info', views.get_user_info, name="get_user_info"),
    path('purchase_stock', views.purchase_stock, name="purchase_stock"),
    path('my_portfolio', views.my_portfolio, name="my_portfolio"),
    path('get_portfolios', views.get_portfolios, name="get_portfolios"),
    path('get_portfolios/<str:symbol>', views.get_portfolios, name="get_portfolios"),
    path('my_transactions', views.my_transactions, name="my_transactions"),
    path('get_transactions', views.get_transactions, name="get_transactions"),
    path("sell_stocks", views.sell_stocks, name="sell_stocks"),
    path("get_user_stats", views.get_user_stats, name="get_user_stats"),
    path('server_check', views.server_check, name="server_check"),
]
