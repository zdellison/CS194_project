var width = 950,
    height = 550;

// set projection
var projection = d3.geo.mercator();

// create path variable
var path = d3.geo.path()
    .projection(projection);


var to_plot_points = [];
d3.json("../prettified_tweets/tweets_hashtags_favs_retweets_geo.json", function(data) {
  tweets = data.tweets;
  for (var i = 0; i < tweets.length; i++) {
    to_plot_points.push(tweets[i].coordinates);

  }
  console.log(to_plot_points);
});

d3.json("us.json", function(error, topo) { console.log(topo);

    states = topojson.feature(topo, topo.objects.states).features

    // set projection parameters
    projection
      .scale(1000)
      .center([-106, 37.5])

    // create svg variable
    var svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height);

    // var legend = svg.append("g")
    //   .attr("class", "legend")
    //   .attr("transform", "translate(" + (width-50) + "," + (height-20) + ")")
    //   .selectAll("g")
    //   .data(["female", "male", "no answer"])
    //   .enter().append("g");

    // legend.append("circle")
    //   .attr("cy", function(d, i) { return height + (i * 10); })
    //   .attr("r", "8px")
    //   .attr("fill", function(d,i) { if (i==0) return "pink"; 
    //     if(i==1) return "steelblue"; return "green" });


    // legend.append("text")
    //   .attr("y", function(d, i) { return height + (i * 10); })
    //   .text(function(d) {return d});

  var legendRectSize = 18;
  var legendSpacing = 4;


  var legend_data = [{"color": "pink", "text": "female"}, {"color": "steelblue", "text": "male"}, 
    {"color": "green", "text": "unspecified"}];
  var legend = svg.selectAll('.legend').data(legend_data)
    .enter()
  .append('g')
  .attr('class', 'legend')
  .attr('transform', function(d, i) {
    var height = legendRectSize + legendSpacing;
    var offset =  height * legend_data.length / 2;
    var horz = -2 * legendRectSize;
    var vert = i * height - offset;
    return 'translate(' + horz + ',' + vert + ')';
  });

  legend.append('rect')
  .attr('width', legendRectSize)
  .attr('height', legendRectSize)
  .style('fill', function(d) { return d.color})
  .style('stroke', function(d) {return d.color});

  legend.append('text')
  .attr('x', legendRectSize + legendSpacing)
  .attr('y', legendRectSize - legendSpacing)
  .text(function(d) { return d.text; });



  // add states from topojson
  svg.selectAll("path")
      .data(states).enter()
      .append("path")
      .attr("class", "feature")
      .style("fill", "steelblue")
      .attr("d", path);

    // put boarder around states 
    svg.append("path")
      .datum(topojson.mesh(topo, topo.objects.states, function(a, b) { return a !== b; }))
      .attr("class", "mesh")
      .attr("d", path);

    // add circles to svg
    svg.selectAll("circle")
    .data(tweets).enter()
    .append("circle")
    .attr("cx", function (d) { console.log(projection(d.coordinates)); 
      if (projection(d.coordinates) != null) return projection(d.coordinates)[0];
      return 0; })
    .attr("cy", function (d) { 
      if (projection(d.coordinates) != null) return projection(d.coordinates)[1];
      return 0; })
    .attr("r", "8px")
    .attr("fill", function (d) { 
      if (d.gender == 0) return "pink";
      else if (d.gender == 1) return "steelblue";
      return "green"; });


    

    

      // when you hover over a dot you should see the name of the user and the approximate location in words
    $('svg circle').tipsy({ 
        gravity: 'w', 
        html: true, 
        title: function() {
          return 'Name, Location';
        }

    });

});
