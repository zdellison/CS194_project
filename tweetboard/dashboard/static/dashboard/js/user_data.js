

var user_id = document.getElementById("hidden_user").innerHTML;

d3.json("/api/get_user_by_id?user_id="+user_id, function(data) {

	console.log(data);
	document.getElementById("profile_name").innerHTML = data.user.name;
	document.getElementById("user_handle").innerHTML = data.user.screen_name;
	document.getElementById("user_location").innerHTML = data.user.location;
	var names = document.getElementsByClassName("tweet_prof_name");
	var screen_names = document.getElementsByClassName("tweet_prof_twitter");

	console.log(names);
	console.log(screen_names);


		[].slice.call( names ).forEach(function ( div ) {
		    div.innerHTML = data.user.name;
		});

		[].slice.call( screen_names ).forEach(function ( div ) {
		    div.innerHTML = data.user.screen_name;
		});

});