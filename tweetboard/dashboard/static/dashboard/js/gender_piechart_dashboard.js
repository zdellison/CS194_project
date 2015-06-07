// used tutorial: http://bl.ocks.org/mbostock/3887235

// pedro changes width and height
var width = 960,
    height = 500,
    radius = Math.min(width, height) / 2;

var color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888"]);

var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.count; });


// pedro changes what to select
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


// pedro changes api call
d3.json("/api/get_gender_total_for_recent_tweets?user_id=HillaryClinton", function(error, data) {

  totals = data.gender_totals;
  // gender_counts = {};
  // gender_counts["female"] = 0;
  // gender_counts["male"] = 0;
  // gender_counts["unknown"] = 0;

  // // data.forEach(function(d) {
  // //   d.population = +d.population;
  // // });

  // users.forEach(function(d) {
  //   var gender = d.gender;
  //   gender_counts[gender] += 1;
  // });
// 
  // console.log(totals);

  var d3format_gender_counts = new Array(3);

  d3format_gender_counts[0] = {"gender": "female", "count": totals.female};
  d3format_gender_counts[1] = {"gender": "male", "count": totals.male};
  d3format_gender_counts[2] = {"gender": "unknown", "count": totals.unknown};


  var g = svg.selectAll(".arc")
      .data(pie(d3format_gender_counts))
    .enter().append("g")
      .attr("class", "arc");

  g.append("path")
      .attr("d", arc)
      .style("fill", function(d) { return color(d.data.gender); });

  g.append("text")
      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .text(function(d) { return d.data.gender; });

});