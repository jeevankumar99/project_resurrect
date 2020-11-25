from django.http.response import Http404, HttpResponse
from django.shortcuts import render

# Create your views here.

def index(request):
    return render(request, "stock/index.html")
