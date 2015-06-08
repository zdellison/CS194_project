//pull from url instead of pulling from json -- can even do it in dashboard_data

var user_id = document.getElementById("hidden_user").innerHTML;

d3.json("/api/get_user_by_id?user_id="+user_id, function(data) {


	var name = data.user.name;
	var screen_name = data.user.screen_name;
	
	document.getElementById("profile_name").innerHTML = name;
	document.getElementById("user_handle").innerHTML = "@"+screen_name;
	document.getElementById("user_location").innerHTML = data.user.location;
	document.getElementById("profile_pic").src = data.user.profile_image_url;
	document.getElementById("followers_count").innerHTML = data.user.followers_count;
	document.getElementById("my_tweets").innerHTML = name.substr(0, name.indexOf(' ')).toUpperCase() + "'S TWEETS";
	document.getElementById("map_text").innerHTML = name.substr(0, name.indexOf(' ')).toUpperCase() + "'S MAP";
	document.getElementById("questions").innerHTML = "QUESTIONS FOR " + name.substr(0, name.indexOf(' ')).toUpperCase();
	document.getElementById("questions").setAttribute("href", "/dashboard/questions?user="+screen_name);
	document.getElementById("map_text").setAttribute("href", "/dashboard/maps?user="+screen_name);
	document.getElementById("back_home").setAttribute("href", "/dashboard?user="+screen_name);
	document.getElementById("logout").setAttribute("href", "/login/logout");
	

});