
d3.json("/api/get_tweets_by_user_id?user_id=HillaryClinton", function(data) {

  // console.log(error);
	var users = data.tweets;
	var user = data.user;
	var handle = data.screen_name;
	

  	users.forEach(function(d) {
  		console.log(d.text);
		var list_div = document.createElement("li");
		$(list_div).attr("class", "tweet_items");
		var div_tweet_name = document.createElement("div");
		$(div_tweet_name).attr("class", "tweet_prof_name").text("Hillary Clinton");
		var div_tweet_handle = document.createElement("div");
		$(div_tweet_handle).attr("class", "tweet_prof_twitter").text("@hillaryclinton");
		var div_tweet_body = document.createElement("div");
		$(div_tweet_body).attr("class", "tweet").text(d.text);

		$(list_div).append(div_tweet_name);
		$(list_div).append(div_tweet_handle);
		$(list_div).append(div_tweet_body);
		
	    document.getElementById("tweet_items_list").appendChild(list_div);
	});
	
});