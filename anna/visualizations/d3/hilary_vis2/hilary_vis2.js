// notes:
// add an index
// change radius based on something
// color code more effectively based on something else




var hashtags;

var width = 960,
    height = 500,
    padding = 1.5, // separation between same-color circles
    clusterPadding = 6, // separation between different-color circles
    maxRadius = 12;


d3.json("../prettified_tweets/hashtags_and_favorites2.json", function(json) {
	hashtags = json.hashtags;


  var n = hashtags.length; // a circle for each hashtag
	var m = 4; // number of distinct clusters, 0-100 retweets is cluster 1, 100-500 is cluster 2, 500-1000 is cluster 3
				// anything above 1000 is cluster 4


	var color = d3.scale.category10().domain(d3.range(m));

	// The largest node for each cluster.
	var clusters = new Array(m);


  hashtags.forEach(function(d) {


    console.log(d.retweet_count);
    console.log(d.favorite_count);
    var i = d.retweet_count % 3; // should be based on a sentiment property


    var r = maxRadius;
    if (d.favorite_count > 1000) {
      r = 50;
    }
    else if (d.favorite_count > 500 && d.favorite_count <=1000) {
      r = 20;
    }
    else {
      r = 10;
    }
    // var r = maxRadius;

    d.radius = r;
    d.cluster = i;
    var x = Math.cos(i / m * 2 * Math.PI) * 200 + width / 2 + Math.random();
    var y = Math.sin(i / m * 2 * Math.PI) * 200 + height / 2 + Math.random();
    d.x = x;
    d.y = y;
    var hashtag_text = d.text;
    new_d = {cluster: i, radius: r, text: hashtag_text, x: x, y: y}
    if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = new_d;
  });


  console.log(hashtags);

// d3.layout.pack().sort(null).size()




	var force = d3.layout.force()
    	.nodes(hashtags)
    	.size([width, height])
    	.gravity(.01)
    	.charge(0)
    	.on("tick", tick)
    	.start();

	var svg = d3.select("body").append("svg")
    	.attr("width", width)
    	.attr("height", height);

	var circle = svg.selectAll("circle")
    	.data(hashtags)
  		.enter().append("circle")
    	.attr("r", function(d) { return d.radius; })
    	.style("fill", function(d) { return color(d.cluster); })
    	.call(force.drag);



  // index element for circle sizes
  var index_elem = d3.select("svg").append("g").attr("id", "index_elem");



  // var size_index_data = [{"text": ">1000", "y": 10}, {"text": "500-1000", "y": 20}, {"text":"<500", "y": 50}];
   index_elem.append("text").text("Size of circle indicates").attr({x:800,y:310,"text-anchor":"middle"});
   // here can have wether it's favorites or number of retweets based on what user selects from the menu
   index_elem.append("text").text("number of favorites").attr({x:800,y:322,"text-anchor":"middle"});
   index_elem.selectAll("circle").data([10,20,50]).enter().append("circle")
        .attr({cx:800,cy:function(d) {return 440-d},r:String}).attr("text", "index")
        .style({fill:"none","stroke-width":2,stroke:"#ccc","stroke-dasharray":"2 2"});
    index_elem.append("text").text(">1000").attr({x:800, y: 380, "text-anchor": "middle", "font-size": "12px"})
    index_elem.append("text").text("500-1000").attr({x:800, y: 415, "text-anchor": "middle", "font-size": "10px"});
    index_elem.append("text").text("<500").attr({x:800, y: 430, "text-anchor": "middle", "font-size": "10px"});


    var color_index_data = [{"text": "positive", "y": 40}, {"text": "neutral", "y": 80}, {"text":"negative", "y": 120}];
    var color_index = d3.select("svg").append("g").attr("id", "color_index");
    color_index.append("text").text("Color of circle").attr({x:800, y: 100, "text-anchor":"middle"});
    color_index.append("text").text("indicates sentiment").attr({x:800, y: 112, "text-anchor":"middle"});
    color_index.selectAll("circle").data(color_index_data).enter().append("circle")
      .attr({cx:800, cy: function(d) {return 100+d.y}, r: maxRadius})
      .style({fill: function(d, i) {return color(i)}});




	function tick(e) {
  		circle
      	.each(cluster(10 * e.alpha * e.alpha))
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
  		var quadtree = d3.geom.quadtree(hashtags);
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


  // make the ones in the visualization more specific
	$('svg circle').tipsy({ 
        gravity: 'w', 
        html: true, 
        title: function() {
          var d = this.__data__, hashtag_text = d.text
          return hashtag_text
        }

    });
});
