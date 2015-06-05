function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}



var	margin = {top: 30, right: 40, bottom: 30, left: 50},
	width = 800 - margin.left - margin.right,
	height = 300 - margin.top - margin.bottom;

// var	parseDate = d3.time.format("%a %b %e %X %Z %Y").parse;
var	parseDate = d3.time.format("%Y-%m-%dT%X").parse;

var	x = d3.time.scale().range([0, width]);
var	y = d3.scale.linear().range([height, 0]);

var	xAxis = d3.svg.axis().scale(x)
	.orient("bottom").ticks(10).tickFormat(d3.time.format("%d-%b-%y %H:%M%p"));

var	yAxis = d3.svg.axis().scale(y)
	.orient("left").ticks(10);


  
var	svg = d3.select("body")
	.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom + margin.bottom)
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Get the data
d3.json("/api/get_tweets_by_user_id?user_id=HillaryClinton", function(error, data) {
	dataset = data.tweets;





		// setup x 
	var xValue = function(d) { return d.created_at;}, // data -> value
   		 // value -> display
    		xMap = function(d) { return x(xValue(d));} // data -> display
    		// xAxis = d3.svg.axis().scale(xScale).orient("bottom");

    // setup y
	var yValue = function(d) { return d.favorites_count;}, // data -> value
    	yMap = function(d) { return y(yValue(d));} // data -> display
    	// yAxis = d3.svg.axis().scale(yScale).orient("left");

    var yValue2 = function(d) { return d.retweet_count;},
    	yMap2 = function(d) {return y(yValue2(d));}

	var color = d3.scale.category10();



	dataset.forEach(function(d) {
		d.created_at = parseDate(d.created_at);
		d.retweet_count = +d.retweet_count;
		d.favorites_count = +d.favorites_count;
		// d.text = d.text;
		d.r = 7;
	});



	// Scale the range of the data
	x.domain(d3.extent(dataset, function(d) { return d.created_at; }));
	y.domain([0, d3.max(dataset, function(d) { return Math.max(d.favorites_count, d.retweet_count); })]);




// draw favorite dots
  svg.selectAll("#dotfav")
      .data(dataset)
    .enter().append("circle")
      .attr("id", "dotfav")
      .transition()  // Transition from old to new
      .duration(10000)  // Length of animation
      .each("start", function() {  // Start animation
         d3.select(this)  // 'this' means the current element
         .attr("fill", "steelblue")  // Change color
         .attr("r", 7);  // Change size
      })
       .delay(function(d, i) {
        	return i / dataset.length * 500;  // Dynamic delay (i.e. each item delays a little longer)
       })
                        //.ease("linear")  // Transition easing - default 'variable' (i.e. has acceleration), also: 'circle', 'elastic', 'bounce', 'linear'
       .attr("cx", xMap)
       .attr("cy", yMap); 

      // draw retweet dots
  svg.selectAll("#retweetdot")
      .data(dataset)
   		.enter().append("circle")
      .attr("id", "retweetdot") 
      .transition()  // Transition from old to new
      .duration(10000)  // Length of animation
      .each("start", function() {  // Start animation
         d3.select(this)  // 'this' means the current element
         .attr("fill", "coral")  // Change color
         .attr("r", 7);  // Change size
      })
       .delay(function(d, i) {
        	return i / dataset.length * 500;  // Dynamic delay (i.e. each item delays a little longer)
       })
                        //.ease("linear")  // Transition easing - default 'variable' (i.e. has acceleration), also: 'circle', 'elastic', 'bounce', 'linear'
       .attr("cx", xMap)
       .attr("cy", yMap2); 


	svg.append("text")
		.attr("transform", "translate(" + 10 + "," + (10) + ")")
		.style("fill", "steelblue").
		on("click", function(){

    	var active   = retweetdot.active ? false : true,
      	newOpacity = active ? 0 : 1;
    // Hide or show the elements
    d3.selectAll("#retweetdot").attr("r", function(d) {
      // console.log(d);
      return newOpacity * d.r;});
    retweetdot.active = active;
  }).text("Favorites");

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
  }).text("Retweets");


	$('svg circle').tipsy({ 
        gravity: 'w', 
        html: true, 
        title: function() {
          var d = this.__data__
          if (d.text) {
          	var heading = d.text + '<br/>' +  (d.created_at).toString() + "<br/>Favorites: " + (d.favorites_count).toString() + "<br/>Retweets: " + (d.retweet_count).toString();
            return heading;
          } 
          return '';
        }

    });

   	svg.append("g")			// Add the X Axis
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis).selectAll(".tick text").call(wrap, 20);;

	svg.append("g")			// Add the Y Axis
		.attr("class", "y axis")
		.call(yAxis);



});