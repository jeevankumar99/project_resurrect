from django.conf.urls import url
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http.response import Http404, HttpResponse, HttpResponseRedirect, JsonResponse
from django.db import IntegrityError
import json
from django.shortcuts import render
from django.urls import reverse
from .models import *

# Create your views here.

@login_required(login_url='/login')
def watchlist_handler(request, symbol=None):
    user = User.objects.get(username=request.user)
    
    # Add or remove stock from watchlists
    if request.method == 'POST':
        data = json.loads(request.body)
        stock_symbol = data.get("stockSymbol")
        action = data.get("action")
       
       # Add the stock to user's watchlist
        if action == "add":
            Watchlist.objects.create(user=user, stock_symbol=stock_symbol)
            print ("watchlist added!")
        # Remove the stock from user's watchlist
        else:
            try:
                Watchlist.objects.get(user=user, stock_symbol=stock_symbol).delete()
            except Watchlist.DoesNotExist:
                print("watchlist removed!")
                return JsonResponse({"error": "Stock not in user's watchlist"}, status=400)            
        
        return JsonResponse({"message": "Backend updated!"}, status=201)

    # Check if stock is already i user's watchlist
    elif request.method == 'GET':
        stock_symbol = symbol
        
        # Stock present in watchlist
        try:
            Watchlist.objects.get(user=user, stock_symbol=stock_symbol)
        
        # Stock not present in watchlist
        except Watchlist.DoesNotExist:
            return JsonResponse({'watching': False}, status=200)
        
        return JsonResponse({'watching': True}, status=200)
    
    # Invalid request
    else: 
        return JsonResponse({"error": "GET or POST required"}, status=400)
        
def get_watchlist(request):
    user = User.objects.get(username=request.user)
    watching_stocks = Watchlist.objects.filter(user=user)
    serialized_watchlist = [stock.serialize() for stock in watching_stocks]
    return JsonResponse(serialized_watchlist, safe=False)

@login_required(login_url='/login')
def watchlist_view(request):
    return render(request, "stock/watchlist.html")

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

def stock_view(request, symbol):
    return render(request, "stock/individual_stock.html", {
        'stock_symbol': symbol
    })

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))
