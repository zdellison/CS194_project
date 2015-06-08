var user_id = document.getElementById("hidden_user").innerHTML;
d3.json("/api/get_question_tweets_at_user_id?user_id="+user_id, function(data) {

	var users = data.tweets;


		users.forEach(function(d) {

	  		
	  		

			var list_div = document.createElement("tr");
			$(list_div).attr("class", "table_row");


			var question_tweet = document.createElement("td");
			$(question_tweet).attr("class", "question_tweet").text(d.tweet.text);
			var question_user = document.createElement("td");
			$(question_user).attr("class", "question_user").text(d.user.name);
			var question_location = document.createElement("td");
			$(question_location).attr("class", "question_location").text(d.user.location);
			var question_retweets = document.createElement("td");
			$(question_retweets).attr("class", "question_retweets").text(d.tweet.retweet_count);
			var question_favorites = document.createElement("td");
			$(question_favorites).attr("class", "question_favorites").text(d.tweet.favorite_count);

			$(list_div).append(question_tweet);
			$(list_div).append(question_user);
			$(list_div).append(question_location);
			$(list_div).append(question_retweets);
			$(list_div).append(question_favorites);
			
			
		    document.getElementById("questions_table").appendChild(list_div);
	});

});