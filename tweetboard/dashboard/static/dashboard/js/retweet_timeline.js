var	margin = {top: 30, right: 40, bottom: 30, left: 50},
	width = 800 - margin.left - margin.right,
	height = 100 - margin.top - margin.bottom;

// "2012-02-07T01:00:24"
var	parseDate = d3.time.format("%Y-%m-%dT%X").parse;

var	x = d3.time.scale().range([0, width]);

var	xAxis = d3.svg.axis().scale(x)
	.orient("bottom").ticks(10);

  
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
d3.json("/api/get_retweet_user_info?tweet_id=602656356953399296", function(error, data) {
	dataset = data.users;


	var color = d3.scale.category10();



	// "2012-02-07T01:00:24"
	dataset.forEach(function(d) {
		console.log(d.created_at);
		d.created_at = parseDate(d.created_at);
		console.log(d.created_at);
	});



	// Scale the range of the data
	x.domain(d3.extent(dataset, function(d) { return d.created_at; }));


	svg.append("g")			// Add the X Axis
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);





		// setup x 
	var xValue = function(d) { return d.created_at;}, // data -> value
   		 // value -> display
    		xMap = function(d) { return x(xValue(d));} // data -> display
    		// xAxis = d3.svg.axis().scale(xScale).orient("bottom");



      // draw retweet dots
  svg.selectAll(".dot")
      .data(dataset)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", xMap)
      .attr("cy", 0)
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



});