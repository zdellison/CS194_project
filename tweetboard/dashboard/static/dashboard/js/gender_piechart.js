// used tutorial: http://bl.ocks.org/mbostock/3887235
(function () {

var width = $("#gender_d3").width(),
    height = $("#gender_d3").height(),
    radius = Math.min(width, height) / 2;

var color = d3.scale.ordinal()
    .range(["#50E3C2", "#205B4E", "#9B9B9B"]);

var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.count; });

var svg_gender_tweet = d3.select("#gender_d3").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


var tweet_id = document.getElementById("hidden_tweet_id").innerHTML;
d3.json("/api/get_retweet_user_info?tweet_id="+tweet_id, function(error, data) {
  

  users = data.users;

  gender_counts = {};
  gender_counts["female"] = 0;
  gender_counts["male"] = 0;
  gender_counts["unknown"] = 0;

  // data.forEach(function(d) {
  //   d.population = +d.population;
  // });

  users.forEach(function(d) {
    var gender = d.user.gender;
    gender_counts[gender] += 1;
  });

  var d3format_gender_counts = new Array(Object.keys(gender_counts).length);

  d3format_gender_counts[0] = {"gender": "female", "count": gender_counts["female"]};
  d3format_gender_counts[1] = {"gender": "male", "count": gender_counts["male"]};
  d3format_gender_counts[2] = {"gender": "unknown", "count": gender_counts["unknown"]};


  var g = svg_gender_tweet.selectAll(".arc")
      .data(pie(d3format_gender_counts))
    .enter().append("g")
      .attr("class", "arc");

  g.append("path")
      .attr("d", arc)
      .style("fill", function(d) { return color(d.data.gender); });

  g.append("text")
      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
      .attr("dy", ".35em")
      .attr("fill", "white")
      .style("text-anchor", "middle")
      .text(function(d) { return d.data.gender; });

});

})(this);