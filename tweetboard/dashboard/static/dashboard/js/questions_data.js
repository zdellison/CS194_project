
var user_id = document.getElementById("hidden_user").innerHTML;
document.getElementById("dashboard_link").setAttribute("href", "/dashboard?user="+user_id);

d3.json("/api/get_user_by_id?user_id="+user_id, function(data) {


	var name = data.user.name;
	var screen_name = data.user.screen_name;
	
	document.getElementById("profile_name").innerHTML = name;
	document.getElementById("user_handle").innerHTML = "@"+screen_name;
	document.getElementById("user_location").innerHTML = data.user.location;
	document.getElementById("profile_pic").src = data.user.profile_image_url;
	
	document.getElementById("my_tweets").innerHTML = name.substr(0, name.indexOf(' ')).toUpperCase() + "'S TWEETS";
	document.getElementById("map_text").innerHTML = name.substr(0, name.indexOf(' ')).toUpperCase() + "'S MAP";
	document.getElementById("questions").innerHTML = "QUESTIONS FOR " + name.substr(0, name.indexOf(' ')).toUpperCase();
	document.getElementById("questions").setAttribute("href", "/dashboard/questions?user="+screen_name);

	document.getElementById("back_home").setAttribute("href", "/dashboard?user="+screen_name);
	document.getElementById("logout").setAttribute("href", "/login/logout");
	

});

var user_id = document.getElementById("hidden_user").innerHTML;
var name;


d3.json("/api/get_tweets_by_user_id?user_id="+user_id, function(data) {

	d3.json("/api/get_user_by_id?user_id="+user_id, function(data) {

	name = data.user.name;
	

});
	
  // console.log(error);
	var users = data.tweets;
	
	var favorite_total = 0;
	var retweet_total = 0;
	var count = 0;
/*
	document.getElementById("profile_name").innerHTML = data.name;
	document.getElementById("user_handle").innerHTML = data.id;
	document.getElementById("user_location").innerHTML = data.location;
*/

  	users.forEach(function(d) {

  		count = count + 1;
  		favorite_total = favorite_total + d.favorite_count;
  		retweet_total = retweet_total + d.retweet_count;
  		//console.log(d.text);
		var list_div = document.createElement("li");
		$(list_div).attr("class", "tweet_items");
		var href_wrapper = document.createElement("a");
		$(href_wrapper).attr("href", "tweet?id="+d.tweet_id);
		var div_tweet_name = document.createElement("div");
		$(div_tweet_name).attr("class", "tweet_prof_name").text(name);
		//console.log(name);
		//$(div_tweet_name).html = name;
		console.log($(div_tweet_name).html);
		var div_tweet_handle = document.createElement("div");
		$(div_tweet_handle).attr("class", "tweet_prof_twitter").text("   @"+name.replace(/\s+/g, ''));
		//console.log(handle);
		//$(div_tweet_handle).html(handle);
		var div_tweet_body = document.createElement("div");
		$(div_tweet_body).attr("class", "tweet").text(d.text);
		var div_tweet_id = document.createElement("div");



		$(list_div).append(href_wrapper);
		$(href_wrapper).append(div_tweet_name);
		$(href_wrapper).append(div_tweet_handle);
		$(href_wrapper).append(div_tweet_body);
		$(href_wrapper).append(div_tweet_id);
		
	    document.getElementById("tweet_items_list").appendChild(list_div);
	});
	
});

d3.json("/api/get_question_tweets_at_user_id?user_id="+user_id, function(data) {

	var users = data.tweets;

		users.forEach(function(d) {

	  		
	  		
			var list_div = document.createElement("tr");
			$(list_div).attr("class", "table_row");


			var question_tweet = document.createElement("td");
			$(question_tweet).attr("class", "question_tweet").text(d.text);
			var question_user = document.createElement("td");
			$(question_user).attr("class", "question_user").text(d.name);
			var question_retweets = document.createElement("td");
			$(question_retweets).attr("class", "question_retweets").text(d.retweet_count);
			var question_favorites = document.createElement("td");
			$(question_favorites).attr("class", "question_favorites").text(d.favorite_count);

			$(list_div).append(question_tweet);
			$(list_div).append(question_user);
			$(list_div).append(question_retweets);
			$(list_div).append(question_favorites);
			
		    document.getElementById("questions_table").appendChild(list_div);
	});

});


