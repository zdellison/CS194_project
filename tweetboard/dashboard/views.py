from django.http import HttpResponse
from django.shortcuts import render
from django.contrib.auth.decorators import login_required



# Create your views here.
@login_required
def index(request):
    context = {'user_id': request.GET['user']}
    return render(request, 'dashboard.html', context)

@login_required
def vizit(request):
	context={}
	return render(request, 'vizit.html', context)

@login_required
def tweet(request):
	# context={"tweet_id": tweet_id}
	context = {'tweet_id': request.GET['id']}
	return render(request, 'tweet_page.html', context)

@login_required
def landing(request):
	context = {}
	return render(request, 'landing.html', context)