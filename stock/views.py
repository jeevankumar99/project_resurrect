from django.contrib.auth import authenticate, login, logout
from django.http.response import Http404, HttpResponse, HttpResponseRedirect
from django.db import IntegrityError
from django.shortcuts import render
from django.urls import reverse
from .models import *

# Create your views here.

def index(request):
    return render(request, "stock/index.html")

def login_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        user_authenticate = authenticate(request, username=username, password=password)

        if user_authenticate is not None:
            login(request, user_authenticate)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "stock/login.html", {
                'err_message': "Invalid Username or Password. Try again."
            })
    return render(request, "stock/login.html")

def profile_view(request):
    return render(request, "stock/profile.html")

def register_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        password_confirm = request.POST["password_confirm"]

        if password != password_confirm:
            return render(request, "stock/register.html", {
                'err_message': "Password do not match. Try again."
            })

        try:
            new_user = User.objects.create_user(username=username, password=password)
            new_user.save()
        except IntegrityError:
            return render(request, "stock/register.html", {
                'err_message': "Username already exists. Try again."
            })
        login(request, new_user)
        return HttpResponseRedirect(reverse("index"))

    return render(request, "stock/register.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))
