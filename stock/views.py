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
def get_user_stats(request):
    print('get_user_stats working')
    if request.method == 'GET':
        user = User.objects.get(username=request.user)
        portfolios = Portfolio.objects.filter(user=user)
        shares_owned = 0
        portfolios_owned = 0
        highest_spent = [0, '']
        highest_shares =[0, '']
        for portfolio in portfolios:
            shares_owned += portfolio.quantity
            if portfolio.total_spent > highest_spent[0]:
                highest_spent[0] = portfolio.total_spent
                highest_spent[1] = portfolio.stock_symbol
            if portfolio.quantity > highest_shares[0]:
                highest_shares[0] = portfolio.quantity
                highest_shares[1] = portfolio.stock_symbol
            portfolios_owned += 1
        portfolio_info = {
            'portfoliosOwned': portfolios_owned,
            'sharesOwned': shares_owned,
            'highestSpent': highest_spent[0],
            'highestSpentStock': highest_spent[1],
            'highestShares': highest_shares[0],
            'highestSharesStock': highest_shares[1],
            'totalInvestment': user.total_investment
        }
        return JsonResponse({**user.serialize(), **portfolio_info}, safe=False)
    else:
        return JsonResponse({'error': 'GET request needed'}, status=400)


@login_required(login_url='/login')
def get_user_info(request):
    print('get_user_info is working')
    if request.method == "GET":
        user = User.objects.get(username=request.user)
        return JsonResponse(user.serialize(), safe=False)
    else:
        return JsonResponse({'error': "only GET request needed"}, status=400)

@login_required(login_url='/login')
def watchlist_view(request):
    return render(request, "stock/watchlist.html")

def index(request):
    return render(request, "stock/index.html")

def get_portfolios(request, symbol=None):
    if request.method == "GET":
        user = User.objects.get(username=request.user)
        if symbol == None:
            portfolios = Portfolio.objects.filter(user=user)
        else:
            portfolios = Portfolio.objects.filter(user=user, stock_symbol=symbol)
            if len(portfolios) < 1:
                return JsonResponse([], safe=False)
        serialized_portfolios = [portfolio.serialize() for portfolio in portfolios]
        return JsonResponse(serialized_portfolios, safe=False)
    else:
        return JsonResponse({'message': "GET request needed"}, status=400)

def get_transactions(request):
    if request.method == 'GET':
        user = User.objects.get(username=request.user)
        transactions = Transaction.objects.filter(user=user).order_by('-timestamp')
        serialized_transactions = [transaction.serialize() for transaction in transactions]
        return JsonResponse(serialized_transactions, safe=False)
    else:
        return JsonResponse({'error': "only GET request needed"}, status=400)

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

@login_required(login_url='/login')
def purchase_stock(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        stock_symbol = data.get('stockSymbol')
        quantity = data.get('quantity')
        balance = data.get('balance')
        total = data.get('total')
        current_price = data.get('currentPrice')
        long_name = data.get('longName')
        user = User.objects.get(username=request.user)
        user.balance = balance
        current_investment = float(user.total_investment)
        user.total_investment = current_investment + total
        user.save()
        Transaction.objects.create(
            user=user,
            stock_symbol=stock_symbol,
            long_name=long_name,
            quantity=quantity,
            price_at_purchase=current_price,
            transaction_type='BUY'
        )
        print(stock_symbol, quantity, balance)
        try:
           existing_portfolio = Portfolio.objects.get(user=user, stock_symbol=stock_symbol)
        except Portfolio.DoesNotExist:
            Portfolio.objects.create(user=user, stock_symbol=stock_symbol, quantity=quantity, total_spent=total)
            return JsonResponse({'message': "Stock purchased"}, status=200)
        existing_portfolio.quantity += quantity
        total_spent = float(existing_portfolio.total_spent)
        existing_portfolio.total_spent = total_spent + total
        existing_portfolio.save()
        return JsonResponse({'message' : 'Stock quantity updated'}, status=200)
    else:
        return JsonResponse({'error': "POST request needed"}, status=400)

def profile_view(request):
    return render(request, "stock/profile.html")

def my_portfolio(request):
    return render(request, "stock/portfolio.html")

def my_transactions(request):
    return render(request, "stock/transactions.html")

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

def sell_stocks(request):

    if request.method == 'PUT':
        data = json.loads(request.body)
        
        # extract data from request body
        stock_symbol = data.get('symbol')
        quantity = data.get('quantity')
        total_credit = data.get('totalCredit')
        current_price = data.get('currentPrice')
        long_name = data.get('longName')
        net_profit_loss = data.get('netProfitLoss')            

        # get user's portfolio info
        user = User.objects.get(username=request.user)
        portfolios = Portfolio.objects.get(user=user,stock_symbol=stock_symbol)
        print (portfolios)
        
        # if user has sold all his shares
        if portfolios.quantity == quantity:
            portfolios.delete()
        
        # else update the quantity of shares
        else:
            portfolios.quantity -= quantity
            current_total_spent = float(portfolios.total_spent)
            portfolios.total_spent = current_total_spent - total_credit
            portfolios.save()
        
        Transaction.objects.create(
            user=user,
            stock_symbol=stock_symbol,
            long_name=long_name,
            quantity=quantity,
            price_at_purchase=current_price,
            transaction_type='SELL'
        )

        # Credit the funds to his account  
        current_balance = float(user.balance) 
        current_investment = float(user.total_investment)
        user.balance = current_balance + total_credit
        user.total_investment = current_investment - total_credit
        if net_profit_loss > 0:
            current_profits = float(user.profits)
            user.profits =  current_profits + net_profit_loss
        else:
            current_losses = float(user.losses)
            user.losses = current_losses + (-1 * net_profit_loss)
        user.save()
        return JsonResponse({'message': "Shares sold, balance updated"}, status=200)

    else:
        return JsonResponse({'error': "PUT required"}, status=400)
        

        

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))
