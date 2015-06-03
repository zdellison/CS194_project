var	margin = {top: 30, right: 40, bottom: 30, left: 50},
	width = 800 - margin.left - margin.right,
	height = 150 - margin.top - margin.bottom;

// "2012-02-07T01:00:24"
var	parseDate = d3.time.format("%Y-%m-%dT%X").parse;

var	x = d3.time.scale().range([0, width]);

var	xAxis = d3.svg.axis().scale(x)
	.orient("bottom").ticks(10);

  

var svg = d3.select("body")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// d3.json("/api/get_tweet_by_id?tweet_id=602656356953399296", function(data) {
//     console.log(data.tweet.text);
//     var tweet_text = data.tweet.text;

//   var textObj = d3.select("body").append("text");

//   var textLabels = textObj
//     .attr("x", margin.left)
//     .attr("y", height + 100)
//     .text(tweet_text)
//     .attr("font-family", "sans-serif")
//     .attr("font-size", "20px")
//     .attr("fill", "black");


// });




// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Get the data
d3.json("/api/get_retweet_user_info?tweet_id=602656356953399296", function(error, data) {
	// dataset = data.users;

  var timestamps = data.created_at;

  
  


	var color = d3.scale.category10();


  


  for (var i = 0; i < timestamps.length; i++) {
      timestamps[i] = parseDate(timestamps[i]);
  }



  // svg.selectAll("text").data(tweet_text).enter().append("text").text(function(d) {return d;}).attr("font-family", "sans-serif").attr("font-size", "20px").attr("fill", "black");


	// Scale the range of the data
	x.domain(d3.extent(timestamps, function(d) { return d; }));



	svg.append("g")			// Add the X Axis
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height/2.0 + ")")
		.call(xAxis);





		// setup x 
	var xValue = function(d) { return d;}, // data -> value
   		 // value -> display
    		xMap = function(d) { return x(xValue(d));} // data -> display
    		// xAxis = d3.svg.axis().scale(xScale).orient("bottom");



      // draw retweet dots
  svg.selectAll(".dot")
      .data(timestamps)
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
          tooltip.html(d + "<br/> (" + x(d) 
	        + ", " + 30 + ")" + "<br/>" + "have any info here about the user that retweeted")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });


    var labelheight = height - 25;
    var labelgobj = svg.append("g").attr("id", "vis_label").attr("transform", "translate(0," + labelheight + ")");
    var labelg2obj = labelgobj.append("g").attr("id", "inner_vis").attr("transform", "translate(0, 0)").attr("style", "opacity: 1;");
    labelgobj.append("text").text("here goes original tweet").attr("dy", ".71em").attr("x", 0).attr("y", 9).attr("font-size", "25px").attr("style", "text-anchor: left;");


});