from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.

def index(request):
    return HttpResponse("Hello, world. You're at the Twitter Login Index.")

def home(request):
    context = {}
    return render(request, 'home.html', context)
