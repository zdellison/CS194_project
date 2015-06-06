

var user_id = document.getElementById("hidden_user").innerHTML;
console.log(user_id);
d3.json("/api/get_tweets_by_user_id?user_id="+user_id, function(data) {

  // console.log(error);
	var users = data.tweets;
	var handle = data.screen_name;
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

