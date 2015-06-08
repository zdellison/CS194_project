// notes:

(function () {

var hashtags;


var width_hashtags = $('#d3js_box_2').width(),
    height_hashtags = $('#d3js_box_2').height(),
    padding_hashtags = 1.5, // separation between same-color circles
    clusterPadding_hashtags = 6, // separation between different-color circles
    maxRadius_hashtags = 12;

var user_id = document.getElementById("hidden_user").innerHTML;
d3.json("/api/get_tweets_by_user_id?user_id="+user_id, function(json) {
	tweets = json.tweets;
  // console.log(tweets);


  // sum of retweets given hashtag was used  / number of tweets hashtag was used


  var n_hashtags = tweets.length; // a circle for each hashtag
	var m_hashtags = 4; // number of distinct clusters, 0-100 retweets is cluster 1, 100-500 is cluster 2, 500-1000 is cluster 3
				// anything above 1000 is cluster 4


  var hashtags_to_numtimes = {}
  var hashtags_to_numretweets = {}
  for (var i = 0; i < n_hashtags; i++) {
    // var hashtag_text = hashtags[i].text;
    var num_hashtags = tweets[i].hashtags.length;

    for (var j = 0; j < num_hashtags; j++) {
      var hashtag_text = tweets[i].hashtags[j];
      if (hashtags_to_numtimes[hashtag_text] != null) {
        hashtags_to_numtimes[hashtag_text] += 1;
        hashtags_to_numretweets[hashtag_text] += tweets[i].retweet_count;
      }
      else {
        hashtags_to_numtimes[hashtag_text] = 1.0;
        hashtags_to_numretweets[hashtag_text] = tweets[i].retweet_count;
      }
    }
  }

  // console.log(hashtags_to_numtimes);

  n_hashtags = Object.keys(hashtags_to_numtimes).length;

	var color_hashtags = d3.scale.category10().domain(d3.range(m_hashtags));

	// The largest node for each cluster.
	var clusters_hashtags = new Array(m_hashtags);

  var keys = Object.keys(hashtags_to_numtimes);

  // console.log(keys);

  var data_hashtags = new Array(n_hashtags);



  keys.forEach(function(d, k) {

    var i = 0;
    var num_retweeted = hashtags_to_numretweets[d];
    if (num_retweeted > 50 && num_retweeted <= 100) {
      i = 1;
    }
    else if (num_retweeted > 100 && num_retweeted <= 500) {
      i = 2;
    } else {
      i = 3;
    }


    console.log(i);
    var r = Math.log((num_retweeted + 1) / (hashtags_to_numtimes[d])) + maxRadius_hashtags;


    d.radius = r;
    d.cluster = i;
    var x = Math.cos(i / m_hashtags * 2 * Math.PI) * 200 + width_hashtags / 2 + Math.random();
    var y = Math.sin(i / m_hashtags * 2 * Math.PI) * 200 + height_hashtags / 2 + Math.random();
    d.x = x;
    d.y = y;
    var hashtag_text = d;
    new_d = {cluster: i, radius: r, text: hashtag_text, x: x, y: y, times_retweeted: num_retweeted, times_used: hashtags_to_numtimes[d]}


    data_hashtags[k] = {"text": d, "radius": r, "x": x, "y": y, "cluster": i, "times_retweeted": num_retweeted, "times_used": hashtags_to_numtimes[d]} 


    // console.log(new_d);
    // hashtags_to_numtimes[d] = new_d;
    if (!clusters_hashtags[i] || (r > clusters_hashtags[i].radius)) clusters_hashtags[i] = new_d;
  });


  // console.log(hashtags);

// d3.layout.pack().sort(null).size()


  // console.log(data);



	var force_hashtags = d3.layout.force()
    	.nodes(data_hashtags)
    	.size([width_hashtags, height_hashtags])
    	.gravity(.05)
    	.charge(0)
    	.on("tick", tick_hashtags)
    	.start();

	var svg_hashtags = d3.select("#d3js_box_2").append("svg").attr("id", "svg_hashtags")
    	.attr("width", width_hashtags)
    	.attr("height", height_hashtags);

	var circle_hashtags = svg_hashtags.selectAll("#circle_hashtags")
    	.data(data_hashtags)
  		.enter().append("circle").attr("id", "circle_hashtags")
    	.attr("r", function(d) { 
        // console.log(d);
        return d.radius; })
    	.style("fill", function(d) { return color_hashtags(d.cluster); })
    	.call(force_hashtags.drag);



  // index element for circle sizes
  // var index_elem = d3.select("svg").append("g").attr("id", "index_elem");



  // // var size_index_data = [{"text": ">1000", "y": 10}, {"text": "500-1000", "y": 20}, {"text":"<500", "y": 50}];
  //  index_elem.append("text").text("Size of circle indicates").attr({x:800,y:310,"text-anchor":"middle"});
  //  // here can have wether it's favorites or number of retweets based on what user selects from the menu
  //  index_elem.append("text").text("number of favorites").attr({x:800,y:322,"text-anchor":"middle"});
  //  index_elem.selectAll("circle").data([10,20,50]).enter().append("circle")
  //       .attr({cx:800,cy:function(d) {return 440-d},r:String}).attr("text", "index")
  //       .style({fill:"none","stroke-width":2,stroke:"#ccc","stroke-dasharray":"2 2"});
  //   index_elem.append("text").text(">1000").attr({x:800, y: 380, "text-anchor": "middle", "font-size": "12px"})
  //   index_elem.append("text").text("500-1000").attr({x:800, y: 415, "text-anchor": "middle", "font-size": "10px"});
  //   index_elem.append("text").text("<500").attr({x:800, y: 430, "text-anchor": "middle", "font-size": "10px"});


    var color_index_data_hashtags = [{"text": "0-50 retweets", "y": 40}, {"text": "50-100 retweets", "y": 80}, {"text":"100-500 retweets", "y": 120}, {"text":">500 retweets", "y": 160}];
    var color_index_hashtags = d3.select("#svg_hashtags").append("g").attr("id", "hashtag_index");
    // color_index.append("text").text("Color of circle").attr({x:800, y: 100, "text-anchor":"middle"});
    // color_index.append("text").text("indicates sentiment").attr({x:800, y: 112, "text-anchor":"middle"});
    color_index_hashtags.selectAll("#hashtag_index").data(color_index_data_hashtags).enter().append("circle")
      .attr({cx:30, cy: function(d) {return d.y}, r: maxRadius_hashtags})
      .style({fill: function(d, i) {return color_hashtags(i)}});

    // var text_color_index = d3.select('svg').append('g').attr('id', 'text_index');
    // text_color_index.selectAll("text").data(color_index_data).enter().append("text")
    //   .text(function (d) { return d.text; }).style("fill", function(d,i) {return color(i)});

    color_index_hashtags.append("text").text("0-50 retweets").attr({x:80, y: 40, "text-anchor": "middle", "font-size": "10px"})
    color_index_hashtags.append("text").text("50-100 retweets").attr({x:80, y: 80, "text-anchor": "middle", "font-size": "10px"});
    color_index_hashtags.append("text").text("100-500 retweets").attr({x:80, y: 120, "text-anchor": "middle", "font-size": "10px"});
    color_index_hashtags.append("text").text(">500 retweets").attr({x:80, y: 160, "text-anchor": "middle", "font-size": "10px"});




	function tick_hashtags(e) {
  		circle_hashtags
      	.each(cluster_hashtags(10 * e.alpha * e.alpha))
      	.each(collide_hashtags(.5))
      	.attr("cx", function(d) { return d.x + 100; })
      	.attr("cy", function(d) { return d.y; });
	}

// Move d to be adjacent to the cluster node.
	function cluster_hashtags(alpha) {
  		return function(d) {
        // console.log(d);
   			var cluster = clusters_hashtags[d.cluster];

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
	function collide_hashtags(alpha) {
  		var quadtree_hashtags = d3.geom.quadtree(data_hashtags);
  		return function(d) {
    		var r = d.radius + maxRadius_hashtags + Math.max(padding_hashtags, clusterPadding_hashtags),
        	nx1 = d.x - r,
        	nx2 = d.x + r,
        	ny1 = d.y - r,
        	ny2 = d.y + r;
    		quadtree_hashtags.visit(function(quad, x1, y1, x2, y2) {
      			if (quad.point && (quad.point !== d)) {
        			var x = d.x - quad.point.x,
            		y = d.y - quad.point.y,
            		l = Math.sqrt(x * x + y * y),
            		r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding_hashtags : clusterPadding_hashtags);
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
	$('#svg_hashtags circle').tipsy({ 
        gravity: 'w', 
        html: true, 
        title: function() {

          var d = this.__data__, hashtag_text = d.text
          if (d.times_retweeted != null) {
          // console.log(d);
            return "#" + hashtag_text + "<br/>" + "times retweeted: " + d.times_retweeted.toString() + "<br/>" + "times used: " + d.times_used.toString()
          }
          return '';
        }

    });
});



})(this);
