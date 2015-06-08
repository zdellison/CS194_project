// more about showing / hiding elements: http://bl.ocks.org/d3noob/5d621a60e2d1d02086bf

(function () { 

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


// pedro changes 800 and 300 width / height values to the selection of the div's width and height, but keep the margins
var	margin = {top: 30, right: 40, bottom: 30, left: 50},

	width = $('#top_d3js_box_2').width() - margin.left - margin.right,
	height = $('#top_d3js_box_2').height() - margin.top - margin.bottom - 20;

// var	parseDate = d3.time.format("%a %b %e %X %Z %Y").parse;
var	parseDate = d3.time.format("%Y-%m-%dT%XZ").parse;

var	x = d3.time.scale().range([0, width]);
var	y = d3.scale.linear().range([height, 0]);

var	xAxis = d3.svg.axis().scale(x)
	.orient("bottom").ticks(10).tickFormat(d3.time.format("%d-%b-%y %H:%M%p"));

var	yAxis = d3.svg.axis().scale(y)
	.orient("left").ticks(10);


// pedro change body to the div id box
var	svg = d3.select("#top_d3js_box_2")
	.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom + margin.bottom)
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// add the tooltip area to the webpage
// pedro changes body to the div id
var tooltip = d3.select("#top_d3js_box_2").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Get the data

// pedro changes api call
var user_id = document.getElementById("hidden_user").innerHTML;
d3.json("/api/get_tweets_by_user_id?user_id="+user_id, function(data) {
	dataset = data.tweets;





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

	var color = d3.scale.category10();



	dataset.forEach(function(d) {
		d.created_at = parseDate(d.created_at);
		d.retweet_count = +d.retweet_count;
		d.favorites_count = +d.favorite_count;
		// d.text = d.text;
		d.r = 7;
	});



	// Scale the range of the data
	x.domain(d3.extent(dataset, function(d) { return d.created_at; }));
	y.domain([0, d3.max(dataset, function(d) { return Math.max(d.favorite_count, d.retweet_count); })]);




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


	svg.append("text").attr("id", "favorites_text")
		.attr("transform", "translate(" + 30 + "," + (10) + ")")
		.style("fill", "steelblue")
		.on("click", function(){

      d3.select(this).attr("font-weight", "bold");
      d3.select("#both_text").attr("font-weight", "normal");
      d3.select("#retweets_text").attr("font-weight", "normal");

      d3.selectAll("#retweetdot").style("opacity", 0);
      d3.selectAll("#dotfav").style("opacity", 1);

      }).text("Favorites");

	svg.append("text").attr("id", "retweets_text")
		.attr("transform", "translate(" + 30 + "," + (30) + ")")
		.style("fill", "coral").
		on("click", function(){
      d3.select(this).attr("font-weight", "bold");
      d3.select("#both_text").attr("font-weight", "normal");
      d3.select("#favorite_text").attr("font-weight", "normal");

      d3.selectAll("#dotfav").style("opacity", 0);
      d3.selectAll("#retweetdot").style("opacity", 1);
  }).text("Retweets");

  svg.append("text").attr("id", "both_text")
    .attr("transform", "translate(" + 30 + "," + (50) + ")").attr("font-weight", "bold")
    .style("fill", "green").
    on("click", function(){
      d3.select(this).attr("font-weight", "bold");
      d3.select("#retweets_text").attr("font-weight", "normal");
      d3.select("#favorites_text").attr("font-weight", "normal");


      d3.selectAll("#dotfav").style("opacity", 1);
      d3.selectAll("#retweetdot").style("opacity", 1);
  }).text("Both");


	$('svg circle').tipsy({ 
        gravity: 'w', 
        html: true, 
        title: function() {
          var d = this.__data__
          if (d.text) {
            console.log(d);
          	var heading = d.text + '<br/>' +  (d.created_at).toString() + "<br/>Favorites: " + (d.favorite_count).toString() + "<br/>Retweets: " + (d.retweet_count).toString();
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


})(this);