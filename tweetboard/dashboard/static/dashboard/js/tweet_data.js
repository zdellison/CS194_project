

var tweet_id = document.getElementById("hidden_tweet_id").innerHTML;

d3.json("/api/get_tweet_by_id?tweet_id="+tweet_id, function(data) {

	document.getElementById("tweet_body").innerHTML = data.tweet.text;


});