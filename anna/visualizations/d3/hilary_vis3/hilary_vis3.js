// useful tutorial for creating axis points: http://alignedleft.com/tutorials/d3/data-types



var dataset;

d3.json("../prettified_tweets/retweets_and_dates.json", function(json) {

	dataset = json.tweets;
	var favorite_counts = [];
	var timestamps = [];
	for (var i = 0; i < dataset.length; i++) {
		favorite_counts.push(dataset[i].favorite_count);
		timestamps.push(dataset[i].created_at);

	}

	var sorted_time = timestamps.sort();
	console.log(sorted_time);
	var x = d3.scale.linear().domain([0, d3.max(favorite_counts)]).range([0, 420]);
	var chart = d3.select(".chart");
	var bars = chart.selectAll("div").data(dataset).enter().append("div");

	textbars = bars.selectAll("div").data(dataset).enter().append("div");
	textbars.text(function(d) {return d.date})
	bars.style("width", function(d) { return x(d.favorite_count) + "px"; });
	bars.text(function(d) {return d.favorite_count});


	var chart = d3.select("svg");




});

