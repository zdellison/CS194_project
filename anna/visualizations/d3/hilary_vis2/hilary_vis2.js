var hashtags;

// var color = d3.scale.category20b();

// d3.json("../prettified_tweets/hashtags_and_favorites.json", function(json) {


// 	dataset = json;

// 	var svgContainer = d3.select("body").append("svg").attr("width", 1000).attr("height", 1000);
// 	var svg = d3.select("svg");
// 	var circle = svg.selectAll("circle").data(dataset.hashtags);
// 	var circleEnter = circle.enter().append("circle");
// 	circleEnter.attr("fill", "steelblue");
// 	circleEnter.attr("cy", 60);
// 	circleEnter.attr("cx", function (d, i) {return i * 100 + 30; });
// 	circleEnter.attr("r", function(d) {return d.retweet_count / 100}); // make dependent on the favorites or retweet count
// 	circleEnter.attr("text", function(d) {return d.text})


// 	 $('svg circle').tipsy({ 
//         gravity: 'w', 
//         html: true, 
//         title: function() {
//           var d = this.__data__, hashtag_text = d.text, favorites = d.favorite_count, retweets = d.retweet_count;
//           return hashtag_text + ", " + favorites + ", " + retweets; 
//         }

//       });



// });


// need to format something that has json in the format of:
// hashtags {text: "blah", favorite_count: 100}, {text: "blah", favorite_count: 100}

var width = 960,
    height = 500,
    padding = 1.5, // separation between same-color circles
    clusterPadding = 6, // separation between different-color circles
    maxRadius = 12;

// var n = 200, // total number of circles
    // m = 10; // number of distinct clusters

// var color = d3.scale.category10()
//     .domain(d3.range(m));

// // The largest node for each cluster.
// var clusters = new Array(m);


d3.json("../prettified_tweets/hashtags_and_favorites.json", function(json) {
	hashtags = json.hashtags;



  var n = hashtags.length // a circle for each hashtag
	var m = 4 // number of distinct clusters, 0-100 retweets is cluster 1, 100-500 is cluster 2, 500-1000 is cluster 3
				// anything above 1000 is cluster 4


	var color = d3.scale.category10().domain(d3.range(m));

	// The largest node for each cluster.
	var clusters = new Array(m);


	var nodes = d3.range(n).map(function() {


  		var i = Math.floor(Math.random() * m), // should be dependent on favorites
    	 	r = Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius, // should be dependent on retweets
    	  	d = {cluster: i, radius: r, text: "hashtag_text"}; // put in stuff from the actual json data
  		if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;

  		return d;
	});

	var force = d3.layout.force()
    	.nodes(nodes)
    	.size([width, height])
    	.gravity(.02)
    	.charge(0)
    	.on("tick", tick)
    	.start();

	var svg = d3.select("body").append("svg")
    	.attr("width", width)
    	.attr("height", height);

	var circle = svg.selectAll("circle")
    	.data(hashtags)
  		.enter().append("circle")
    	.attr("r", function(d) { return Math.log(d.retweet_count) * maxRadius; })
    	.style("fill", function(d) { return color(1); })
    	.call(force.drag);

	function tick(e) {
  		circle
      	// .each(cluster(10 * e.alpha * e.alpha))
      	.each(collide(.5))
      	.attr("cx", function(d) { return d.x; })
      	.attr("cy", function(d) { return d.y; });
	}

// Move d to be adjacent to the cluster node.
	function cluster(alpha) {
  		return function(d) {
   			var cluster = clusters[d.cluster];
    		if (cluster === d) return;
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
  		var quadtree = d3.geom.quadtree(nodes);
  		return function(d) {
    		var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
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


	$('svg circle').tipsy({ 
        gravity: 'w', 
        html: true, 
        title: function() {
          var d = this.__data__, hashtag_text = d.text
          return hashtag_text
        }

    });
});
