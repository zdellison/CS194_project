(function () {



var dates = {};

// pedro select width and height
var margin = {top: 20, right: 20, bottom: 70, left: 40},
    width = $('#not_gender_d3').width() - margin.left - margin.right,
    height = $('#not_gender_d3').height() - margin.top - margin.bottom;

// Parse the date / time
// var parseDate = d3.time.format("%Y-%m").parse;
var	parseDate = d3.time.format("%Y-%m-%dT%XZ").parse;

var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);

var y = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(d3.time.format("%m-%d %I%p"));

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10);


// pedro select div
var svg = d3.select("#not_gender_d3").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

// pedro change api call
var tweet_id = document.getElementById("hidden_tweet_id").innerHTML;
d3.json("/api/get_retweet_user_info?tweet_id="+tweet_id, function(error, data) {

	var users = data.users;

	var bucketParser = d3.time.format("%Y-%m-%d%I%p");
	var bucketParser2 = d3.time.format("%Y-%m-%d%I%p").parse;

    users.forEach(function(d) {
        var date = parseDate(d.retweet.created_at);
        date = bucketParser(date);
        //console.log(d.date);
        //console.log(bucketParser(d.date));
        if (dates[date] != null) {
        	dates[date] += 1;
        }
        else {
        	dates[date] = 1;
        }

    });


    var num_dif_dates = Object.keys(dates).length;
    
    var d3_format_dates = new Array(num_dif_dates);

    var i = 0;
    for (date in dates) {
    	d3_format_dates[i] = {"date": bucketParser2(date), "count": +dates[date]};
    	i += 1;
	}	




 
  x.domain(d3_format_dates.map(function(d) { return d.date; }));
  y.domain([0, d3.max(d3_format_dates, function(d) { return d.count; })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-90)" );

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("# retweets");

  svg.selectAll("bar")
      .data(d3_format_dates)
    .enter().append("rect")
      .style("fill", "#242C39")
      .attr("x", function(d) { return x(d.date); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.count); })
      .attr("height", function(d) { return height - y(d.count); });

});


})(this);







