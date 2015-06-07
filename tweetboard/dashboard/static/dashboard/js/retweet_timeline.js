var	margin_timeline = {top: 30, right: 40, bottom: 30, left: 50},
	width_timeline = 800 - margin_timeline.left - margin_timeline.right,
	height_timeline = 150 - margin_timeline.top - margin_timeline.bottom;

// "2012-02-07T01:00:24"
var	parseDate = d3.time.format("%Y-%m-%dT%X").parse;

var	x = d3.time.scale().range([0, width]);

var	xAxis = d3.svg.axis().scale(x)
	.orient("bottom").ticks(10);

  
// change what element we append it to
var svg_retweet_timeline = d3.select("body")
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




// // add the tooltip area to the webpage
// var tooltip = d3.select("body").append("div")
//     .attr("class", "tooltip")
//     .style("opacity", 0);

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



	svg_retweet_timeline.append("g")			// Add the X Axis
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height/2.0 + ")")
		.call(xAxis);





		// setup x 
	var xValue = function(d) { return d;}, // data -> value
   		 // value -> display
    		xMap = function(d) { return x(xValue(d));} // data -> display
    		// xAxis = d3.svg.axis().scale(xScale).orient("bottom");



      // draw retweet dots
  // svg.selectAll(".dot")
  //     .data(timestamps)
  //   .enter().append("circle")
  //     .attr("class", "dot")
  //     .attr("r", 3.5)
  //     .attr("cx", xMap)
  //     .attr("cy", 0)
  //     .style("fill", function(d) { return "coral";})
  //     .on("mouseover", function(d) {
  //         tooltip.transition()
  //              .duration(200)
  //              .style("opacity", .9);
  //         tooltip.html(d + "<br/> (" + x(d) 
	 //        + ", " + 30 + ")" + "<br/>" + "have any info here about the user that retweeted")
  //              .style("left", (d3.event.pageX + 5) + "px")
  //              .style("top", (d3.event.pageY - 28) + "px");
  //     })
  //     .on("mouseout", function(d) {
  //         tooltip.transition()
  //              .duration(500)
  //              .style("opacity", 0);
  //     });


  // draw favorite dots
  svg_retweet_timeline.selectAll("#retweet_timeline_circles")
      .data(timestamps)
      .enter().append("circle")
      .attr("id", "retweet_timeline_circles")
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
       .attr("cy", 0); 


    $('svg circle').tipsy({ 
        gravity: 'w', 
        html: true, 
        title: function() {
          var d = this.__data__
          if (d.text) {
            var heading = d.text + '<br/>' +  (d.created_at).toString();
            return heading;
          } 
          return '';
        }

    });


    // var labelheight = height - 25;
    // var labelgobj = svg.append("g").attr("id", "vis_label").attr("transform", "translate(0," + labelheight + ")");
    // var labelg2obj = labelgobj.append("g").attr("id", "inner_vis").attr("transform", "translate(0, 0)").attr("style", "opacity: 1;");
    // labelgobj.append("text").text("here goes original tweet").attr("dy", ".71em").attr("x", 0).attr("y", 9).attr("font-size", "25px").attr("style", "text-anchor: left;");


});