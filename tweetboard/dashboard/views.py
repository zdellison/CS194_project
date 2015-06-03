from django.http import HttpResponse
from django.shortcuts import render
from django.contrib.auth.decorators import login_required



# Create your views here.
@login_required
def index(request):
    context = {}
    return render(request, 'dashboard.html', context)

@login_required
def vizit(request):
	context={}
	return render(request, 'vizit.html', context)

@login_required
def tweet(request, tweet_id):
	context={"tweet_id": tweet_id}
	return render(request, 'tweet.html', context)

