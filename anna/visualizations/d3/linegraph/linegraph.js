var	margin = {top: 30, right: 40, bottom: 30, left: 50},
	width = 800 - margin.left - margin.right,
	height = 270 - margin.top - margin.bottom;

var	parseDate = d3.time.format("%a %b %e %X %Z %Y").parse;

var	x = d3.time.scale().range([0, width]);
var	y = d3.scale.linear().range([height, 0]);

var	xAxis = d3.svg.axis().scale(x)
	.orient("bottom").ticks(5);

var	yAxis = d3.svg.axis().scale(y)
	.orient("left").ticks(5);

var	valueline = d3.svg.line()
	.x(function(d) { return x(d.created_at); })
	.y(function(d) { return y(d.favorite_count); });
	
var	valueline2 = d3.svg.line()
	.x(function(d) { return x(d.created_at); })
	.y(function(d) { return y(d.retweet_count); });
  
var	svg = d3.select("body")
	.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Get the data
d3.json("../prettified_tweets/retweets_and_dates2.json", function(error, data) {
	dataset = data.tweets;
	// var timestamps = [];
	// for (var i = 0; i < dataset.length; i++) {
	// 	favorite_counts.push(dataset[i].favorite_count);
	// 	timestamps.push(dataset[i].created_at);
	// }

	var color = d3.scale.category10();



	dataset.forEach(function(d) {
		d.created_at = parseDate(d.created_at);
		d.retweet_count = +d.retweet_count;
		d.favorite_count = +d.favorite_count;
		d.r = 3.5;
	});



	// Scale the range of the data
	x.domain(d3.extent(dataset, function(d) { return d.created_at; }));
	y.domain([0, d3.max(dataset, function(d) { return Math.max(d.favorite_count, d.retweet_count); })]);

	// svg.append("path")		// Add the valueline path.
	// 	.attr("class", "line")
	// 	.attr("d", valueline(dataset));

	// svg.append("path")		// Add the valueline2 path.
	// 	.attr("class", "line")
	// 	.style("stroke", "red")
	// 	.attr("d", valueline2(dataset));

	svg.append("g")			// Add the X Axis
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	svg.append("g")			// Add the Y Axis
		.attr("class", "y axis")
		.call(yAxis);

	// svg.append("text")
	// 	.attr("transform", "translate(" + (width+3) + "," + y(dataset[0].favorite_count) + ")")
	// 	.attr("dy", ".35em")
	// 	.attr("text-anchor", "start")
	// 	.style("fill", "red")
	// 	.text("Favorites");


		// setup x 
	var xValue = function(d) { return d.created_at;}, // data -> value
   		 // value -> display
    		xMap = function(d) { return x(xValue(d));} // data -> display
    		// xAxis = d3.svg.axis().scale(xScale).orient("bottom");

    // setup y
	var yValue = function(d) { return d.favorite_count;}, // data -> value
    	yMap = function(d) { return y(yValue(d));} // data -> display
    	// yAxis = d3.svg.axis().scale(yScale).orient("left");

    var yValue2 = function(d) { return d.retweet_count;},
    	yMap2 = function(d) {return y(yValue2(d));}

// draw favorite dots
  svg.selectAll("#dotfav")
      .data(dataset)
    .enter().append("circle")
      .attr("id", "dotfav")
      .attr("r", 3.5)
      .attr("cx", xMap)
      .attr("cy", yMap)
      .style("fill", function(d) { return "steelblue";}) 
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html(d.created_at + "<br/> (" + x(d) 
	        + ", " + y(d) + ")")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });

      // draw retweet dots
  svg.selectAll("#retweetdot")
      .data(dataset)
   		.enter().append("circle")
      .attr("id", "retweetdot") 
      .attr("r", 3.5)
      .attr("cx", xMap)
      .attr("cy", yMap2)
      .style("fill", function(d) { return "coral";}) 
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html(d.created_at + "<br/> (" + x(d) 
	        + ", " + y(d) + ")")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });


	svg.append("text")
		.attr("transform", "translate(" + 10 + "," + (10) + ")")
		.style("fill", "steelblue").
		on("click", function(){

    	var active   = retweetdot.active ? false : true,
      	newOpacity = active ? 0 : 1;
    // Hide or show the elements
    d3.selectAll("#retweetdot").attr("r", function(d) {
      console.log(d);
      return newOpacity * d.r;});
    retweetdot.active = active;
  }).text("Retweets");

	svg.append("text")
		.attr("transform", "translate(" + 10 + "," + (30) + ")")
		.style("fill", "coral").
		on("click", function(){

    	var active   = dotfav.active ? false : true,
      	newOpacity = active ? 0 : 1;
    // Hide or show the elements
    d3.selectAll("#dotfav").attr("r", function(d) {
      console.log(d);
      return newOpacity * d.r;});
    dotfav.active = active;
  }).text("Favorites");

// console.log(dataset.length-1);
// console.log(dataset[dataset.length-1].open);
// console.log(dataset[0].open);
// console.log(y(dataset[0].open));
// console.log(y(dataset[0].close));

});