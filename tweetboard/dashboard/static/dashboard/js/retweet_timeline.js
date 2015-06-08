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


var	margin_timeline = {top: 30, right: 40, bottom: 30, left: 50},
	width_timeline = $('#tweet_d3js_box').width() - margin_timeline.left - margin_timeline.right,
	height_timeline = $('#tweet_d3js_box').height() - 60;

  console.log(width_timeline);
  console.log(height_timeline);

// "2012-02-07T01:00:24"
var	parseDate = d3.time.format("%Y-%m-%dT%XZ").parse;

var	x = d3.time.scale().range([0, width_timeline]);
var y = d3.scale.linear().range([height_timeline, 0]);

var	xAxis = d3.svg.axis().scale(x).tickFormat(d3.time.format("%d-%b-%y %H:%M%p"))
	.orient("bottom").ticks(10);

var yAxis = d3.svg.axis().scale(y)
  .orient("left").ticks(10);

  
// change what element we append it to
var svg_retweet_timeline = d3.select("#tweet_d3js_box")
  .append("svg").attr("id", "svg_retweet_timeline")
    .attr("width", width_timeline + margin_timeline.left + margin_timeline.right)
    .attr("height", height_timeline + margin_timeline.top + margin_timeline.bottom)
    .append("g")
    .attr("transform", "translate(" + margin_timeline.left + "," + margin_timeline.top + ")");

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
var tweet_id = document.getElementById("hidden_tweet_id").innerHTML;
d3.json("/api/get_retweet_user_info?tweet_id="+tweet_id, function(error, data) {
	// dataset = data.users;
  var users = data.users;



  // var timestamps = data.created_at;

  var timestamps = new Array(users.length);
  


	// var color = d3.scale.category10();
  var color = d3.scale.ordinal()
    .range(["#50E3C2", "#205B4E", "#9B9B9B", "#242C39"]);

  


  for (var i = 0; i < timestamps.length; i++) {
      timestamps[i] = parseDate(users[i].retweet.created_at);
  }



  // svg.selectAll("text").data(tweet_text).enter().append("text").text(function(d) {return d;}).attr("font-family", "sans-serif").attr("font-size", "20px").attr("fill", "black");


	// Scale the range of the data
	// x.domain(d3.extent(timestamps, function(d) { return d; }));



  users.forEach(function(d) {
    d.created_at = parseDate(d.retweet.created_at);
    // console.log(d);
    //console.log(d.user.followers_count);
    d.followers_count = +d.user.followers_count;
    d.gender = d.user.gender;
    d.text = "tweeted by: " + d.user.screen_name;
    // d.favorites_count = +d.favorite_count;
    // d.text = d.text;
    d.r = 7;
  });






		// setup x 
	var xValue = function(d) { return d.created_at;}, // data -> value
   		 // value -> display
    		xMap = function(d) { return x(xValue(d)) + 10;} // data -> display
    		// xAxis = d3.svg.axis().scale(xScale).orient("bottom");


  // setup y
  var yValue = function(d) { return d.followers_count;}, // data -> value
      yMap = function(d) { return y(yValue(d)) -40;} // data -> display



        // Scale the range of the data
  x.domain(d3.extent(users, function(d) { return d.created_at; }));
  y.domain([0, d3.max(users, function(d) { return d.followers_count })]);





  // draw retweet
  svg_retweet_timeline.selectAll("#retweet_timeline_circles")
      .data(users)
      .enter().append("circle")
      .attr("id", function (d) {
        return "retweet_timeline_circles_" + d.gender; })
      .transition()  // Transition from old to new
      .duration(10000)  // Length of animation
      .each("start", function() {  // Start animation
         d3.select(this)  // 'this' means the current element
         .attr("fill", function (d) {
          if (d.gender == "male" ) 
            {
              return color(0);
            }
          else if (d.gender == "female") {return color(1);}
          return color(2)})  // Change color
         .attr("r", 7);  // Change size
      })
       .delay(function(d, i) {
          return i / users.length * 500;  // Dynamic delay (i.e. each item delays a little longer)
       })
                        //.ease("linear")  // Transition easing - default 'variable' (i.e. has acceleration), also: 'circle', 'elastic', 'bounce', 'linear'
       .attr("cx", xMap)
       .attr("cy", yMap); 




    // index 
      svg_retweet_timeline.append("text").attr("id", "males_text")
    .attr("transform", "translate(" + (width_timeline-50) + "," + (10) + ")")
    .style("fill", color(0))
    .on("click", function(){

      d3.select(this).attr("font-weight", "bold");
      d3.select("#females_text").attr("font-weight", "normal");
      d3.select("#unknown_text").attr("font-weight", "normal");
      d3.select("#all_text").attr("font-weight", "normal");

      d3.selectAll("#retweet_timeline_circles_female").style("opacity", 0);
      d3.selectAll("#retweet_timeline_circles_unknown").style("opacity", 0);
      d3.selectAll("#retweet_timeline_circles_male").style("opacity", 1);

      }).text("males").attr("font-size", "20px");

  svg_retweet_timeline.append("text").attr("id", "females_text")
    .attr("transform", "translate(" + (width_timeline - 50) + "," + (40) + ")")
    .style("fill", color(1)).
    on("click", function(){
      d3.select(this).attr("font-weight", "bold");
      d3.select("#males_text").attr("font-weight", "normal");
      d3.select("#unknown_text").attr("font-weight", "normal");
      d3.select("#all_text").attr("font-weight", "normal");

      d3.selectAll("#retweet_timeline_circles_female").style("opacity", 1);
      d3.selectAll("#retweet_timeline_circles_unknown").style("opacity", 0);
      d3.selectAll("#retweet_timeline_circles_male").style("opacity", 0);
  }).text("females").attr("font-size", "20px");

  svg_retweet_timeline.append("text").attr("id", "unknown_text")
    .attr("transform", "translate(" + (width_timeline - 50) + "," + (70) + ")")
    .style("fill", color(2)).
    on("click", function(){
      d3.select(this).attr("font-weight", "bold");
      d3.select("#females_text").attr("font-weight", "normal");
      d3.select("#males_text").attr("font-weight", "normal");
      d3.select("#all_text").attr("font-weight", "normal");

      d3.selectAll("#retweet_timeline_circles_female").style("opacity", 0);
      d3.selectAll("#retweet_timeline_circles_unknown").style("opacity", 1);
      d3.selectAll("#retweet_timeline_circles_male").style("opacity", 0);
  }).text("unknown").attr("font-size", "20px");

      svg_retweet_timeline.append("text").attr("id", "all_text")
    .attr("transform", "translate(" + (width_timeline - 50) + "," + (100) + ")").attr("font-weight", "bold")
    .style("fill", color(3)).
    on("click", function(){
      d3.select(this).attr("font-weight", "bold");
      d3.select("#females_text").attr("font-weight", "normal");
      d3.select("#males_text").attr("font-weight", "normal");
      d3.select("#unknown_text").attr("font-weight", "normal");

      d3.selectAll("#retweet_timeline_circles_female").style("opacity", 1);
      d3.selectAll("#retweet_timeline_circles_unknown").style("opacity", 1);
      d3.selectAll("#retweet_timeline_circles_male").style("opacity", 1);
  }).text("all").attr("font-size", "20px");


    $('#svg_retweet_timeline circle').tipsy({ 
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

        // Add the text label for the x axis
    


    svg_retweet_timeline.append("g")     // Add the X Axis
    .attr("class", "x axis")
    .attr("transform", "translate(10," + (height_timeline - 40) + ")")
    .call(xAxis).selectAll(".tick text").call(wrap, 20);;

    svg_retweet_timeline.append("g")     // Add the Y Axis
    .attr("class", "y axis")
    .attr("transform", "translate(10, " + (-40) + ")")
    .call(yAxis);


       // Add the text label for the Y axis
    svg_retweet_timeline.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin_timeline.left)
        .attr("x",0 - (height_timeline / 2) + 10)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("# of followers").attr("font-size", "12px");

    // svg_retweet_timeline.append("g")
    //   .attr("class", "y axis")
    //   .call(yAxis)
    // .append("text")
    //   .attr("transform", "rotate(-90)")
    //   .attr("y", -40)
    //   .attr("dy", ".71em")
    //   .style("text-anchor", "end")
    //   .text("# followers");

    // var labelheight = height - 25;
    // var labelgobj = svg.append("g").attr("id", "vis_label").attr("transform", "translate(0," + labelheight + ")");
    // var labelg2obj = labelgobj.append("g").attr("id", "inner_vis").attr("transform", "translate(0, 0)").attr("style", "opacity: 1;");
    // labelgobj.append("text").text("here goes original tweet").attr("dy", ".71em").attr("x", 0).attr("y", 9).attr("font-size", "25px").attr("style", "text-anchor: left;");


});

})(this);