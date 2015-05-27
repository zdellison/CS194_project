// notes:
// add an index
// change radius based on something
// color code more effectively based on something else


// d3.json("/api/get_users_retweet_by_original_user?user_id=Hillary Clinton", function(error, json)


var users;

var padding = 1.5, // separation between same-color circles
    clusterPadding = 6, // separation between different-color circles
    maxRadius = 12;

var width = $('#top_d3js_box').width();
var height = $('#top_d3js_box').height();

d3.json("/api/get_tweets_by_user_id?user_id=HillaryClinton", function(data) {

  // console.log(error);
	users = data.tweets;


 //  var n = hashtags.length; // a circle for each hashtag
	// var m = 4; // number of distinct clusters, 0-100 retweets is cluster 1, 100-500 is cluster 2, 500-1000 is cluster 3
	// 			// anything above 1000 is cluster 4

  var m = 3;
	var color = d3.scale.category10().domain(d3.range(m));

	// The largest node for each cluster.
	var clusters = new Array(m);


  users.forEach(function(d) {

    // console.log(d);
    var i = 0;
    if (d.sentiment.polarity < 0) {
      i = 1;
    } else if (d.sentiment.polarity == 0) {
      i = 2;
    }

    // console.log(d.sentiment.polarity);

    var r = maxRadius + maxRadius * d.sentiment.subjectivity;
    var x = Math.cos(i / m * 2 * Math.PI) * 200 + width / 2 + Math.random();
    var y = Math.sin(i / m * 2 * Math.PI) * 200 + height / 2 + Math.random();
    // console.log(x);
    // console.log(y);
    d.x = x;
    d.y = y;
    d.cluster = i;
    d.radius = r;
    var tweet_text = d.text;
    new_d = {cluster: i, radius: r, text: tweet_text, x: x, y: y}
    // console.log(new_d);
    if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = new_d;
  });


	var force = d3.layout.force()
    	.nodes(users)
    	.size([width, height])
    	.gravity(.01)
    	.charge(0)
    	.on("tick", tick)
    	.start();

	var svg = d3.select("#top_d3js_box").append("svg")
    	.attr("width", width)
    	.attr("height", height);


  var circle = svg.selectAll("circle")
      .data(users)
      .enter().append("circle")
      .attr("r", function(d) { return d.radius; })
      .style("fill", function(d) { return color(d.cluster); })
      .call(force.drag);



	function tick(e) {

  		circle
      	.each(cluster(10 * e.alpha * e.alpha))
      	.each(collide(.5))
      	.attr("cx", function(d) { return d.x; })
      	.attr("cy", function(d) { return d.y; });
	}

  function cluster(alpha) {
      return function(d) {
        var cluster = clusters[d.cluster];
        console.log(clusters);
        console.log(d.cluster);
        // console.log(cluster);
        // var cluster = 1;
        if (cluster === d) return;
        console.log(d);
        console.log(cluster);
        var x = d.x - cluster.x,
          y = d.y - cluster.y,
          l = Math.sqrt(x * x + y * y),
          r = d.radius + cluster.radius;
        if (l != r) {
            l = (l - r) / l * alpha;
            d.x -= x *= l;
            d.y -= y *= l;
            cluster.x += x;
            cluster.y += y;
        }
      };
  }

// Resolves collisions between d and all other circles.
	function collide(alpha) {
  		var quadtree = d3.geom.quadtree(users);
  		return function(d) {
    		var r = 12 + 12 + Math.max(padding, clusterPadding),
        	nx1 = d.x - r,
        	nx2 = d.x + r,
        	ny1 = d.y - r,
        	ny2 = d.y + r;
    		quadtree.visit(function(quad, x1, y1, x2, y2) {
      			if (quad.point && (quad.point !== d)) {
        			var x = d.x - quad.point.x,
            		y = d.y - quad.point.y,
            		l = Math.sqrt(x * x + y * y),
            		r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
        			if (l < r) {
          				l = (l - r) / l * alpha;
          				d.x -= x *= l;
          				d.y -= y *= l;
          				quad.point.x += x;
          				quad.point.y += y;
        			}
      			}
      			return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    		});
  		};
	}


  // make the ones in the visualization more specific
	$('svg circle').tipsy({ 
        gravity: 'w', 
        html: true, 
        title: function() {
          var d = this.__data__, username = d.text
          return username
        }

    });
});
