//pull from url instead of pulling from json -- can even do it in dashboard_data

var user_id = document.getElementById("hidden_user").innerHTML;

d3.json("/api/get_user_by_id?user_id="+user_id, function(data) {


	var name = data.user.name;
	var screen_name = data.user.screen_name;
	
	document.getElementById("profile_name").innerHTML = name;
	document.getElementById("user_handle").innerHTML = screen_name;
	document.getElementById("user_location").innerHTML = data.user.location;

	document.getElementById("home_wrapper").setAttribute("href", "/dashboard?user="+screen_name);
	
	var names = document.getElementsByClassName("tweet_prof_name");
	console.log(names);
	var screen_names = document.getElementsByClassName("tweet_prof_twitter");

		for(s in names){
			console.log(s.innerHTML);
			s.innerHTML = name;
			console.log(names);
		}
		

		[].slice.call( screen_names ).forEach(function ( s ) {
		    s.innerHTML = screen_name;
		    
		});

});