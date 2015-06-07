

var tweet_id = document.getElementById("hidden_tweet_id").innerHTML;
var user_id;


var string = "/api/get_tweet_by_id?tweet_id="+tweet_id;


d3.json(string, function(data) {

	
	document.getElementById("tweet_body").innerHTML = data.tweet.text;
	user_id = data.tweet.created_by_id;

	document.getElementById("retweet_count").innerHTML = data.tweet.retweet_count;
	document.getElementById("favorite_count").innerHTML = data.tweet.favorite_count;

	
	//document.getElementById("date_created").innerHTML = data.tweet.created_at;
	
	d3.json("/api/get_tweets_by_user_id?user_id="+user_id, function(da) {

	  // console.log(error);
		var users = da.tweets;
		var handle = da.screen_name;
	/*
		document.getElementById("profile_name").innerHTML = data.name;
		document.getElementById("user_handle").innerHTML = data.id;
		document.getElementById("user_location").innerHTML = data.location;
	*/

	  	users.forEach(function(d) {
	  		//console.log(d.text);
			var list_div = document.createElement("li");
			$(list_div).attr("class", "tweet_items");
			var href_wrapper = document.createElement("a");
			$(href_wrapper).attr("href", "tweet?id="+d.tweet_id);
			var div_tweet_name = document.createElement("div");
			$(div_tweet_name).attr("class", "tweet_prof_name");
			var div_tweet_handle = document.createElement("div");
			$(div_tweet_handle).attr("class", "tweet_prof_twitter");
			var div_tweet_body = document.createElement("div");
			$(div_tweet_body).attr("class", "tweet").text(d.text);

			$(list_div).append(href_wrapper);
			$(href_wrapper).append(div_tweet_name);
			$(href_wrapper).append(div_tweet_handle);
			$(href_wrapper).append(div_tweet_body);
			
		    document.getElementById("tweet_items_list").appendChild(list_div);
		});
	
	});

	user_id = data.tweet.created_by_id;
	
	document.getElementById("dashboard_link").setAttribute("href", "/dashboard?user="+user_id);
	document.getElementById("logout").setAttribute("href", "/login/logout");

	d3.json("/api/get_user_by_id?user_id="+user_id, function(d) {

	

	var name = d.user.name;
	var screen_name = d.user.screen_name;
	
	document.getElementById("profile_name").innerHTML = name;
	document.getElementById("user_handle").innerHTML = screen_name;
	document.getElementById("user_location").innerHTML = d.user.location;
	document.getElementById("profile_pic").src = d.user.profile_image_url;

	document.getElementById("back_home").setAttribute("href", "/dashboard?user="+screen_name);
	
	var names = document.getElementsByClassName("tweet_prof_name");
	console.log(names);
	var screen_names = document.getElementsByClassName("tweet_prof_twitter");
		

		[].slice.call( screen_names ).forEach(function ( s ) {
		    s.innerHTML = screen_name;
		    
		});

	});
});

console.log(user_id);