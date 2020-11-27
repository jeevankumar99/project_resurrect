from django.urls.conf import path
from . import views

urlpatterns = [
    path('', views.index, name="index"),
    path('login', views.login_view, name="login"),
    path('register', views.register_view, name="register"),
    path('logout', views.logout_view, name="logout"),
    path('my_profile', views.profile_view, name="profile"),
    path('add_watchlist', views.add_watchlist, name="add_watchlist"),
]
