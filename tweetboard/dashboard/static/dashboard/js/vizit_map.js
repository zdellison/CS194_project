// notes:
// add an index
// change radius based on something
// color code more effectively based on something else


// d3.json("/api/get_users_retweet_by_original_user?user_id=Hillary Clinton", function(error, json)
(function () {

var tweets;

var padding_vizit = 1.5, // separation between same-color circles
    clusterPadding_vizit = 6, // separation between different-color circles
    maxRadius_vizit = 12;

var width_1 = $('#not_gender_d3').width();
var height_1 = $('#not_gender_d3').height();

//var width = 950;
//var height = 500;
var user_id = document.getElementById("hidden_user").innerHTML;
d3.json("/api/get_tweets_by_user_id?user_id="+user_id, function(data) {

  // console.log(error);
	tweets = data.tweets;
  // console.log(users);


 //  var n = hashtags.length; // a circle for each hashtag
	// var m = 4; // number of distinct clusters, 0-100 retweets is cluster 1, 100-500 is cluster 2, 500-1000 is cluster 3
	// 			// anything above 1000 is cluster 4

  var m = 3;
	var color = d3.scale.category10().domain(d3.range(m));

	// The largest node for each cluster.
	var clusters_vizit = new Array(m);


  tweets.forEach(function(d) {

    // console.log(d);
    var i = 0;
    if (d.sentiment.polarity < 0) {
      i = 1;
    } else if (d.sentiment.polarity == 0) {
      i = 2;
    }

    // console.log(d.sentiment.polarity);

    var r = maxRadius_vizit + maxRadius_vizit * d.sentiment.subjectivity;
    var r = 25;
    if (d.sentiment.subjectivity == 1.0) {
      r = 40;
    }
    else if (d.sentiment.subjectivity == 0) {
      r = 10;
    }
    else if (d.sentiment.subjectivity < 0.5) {
      r = 15;
    }
    // var r = maxRadius;
    // if (d.retweet_count < 100) {
    //       r = 10;
    // }
    // else if (d.retweet_count < 500) {
    //   r = 20;
    // }
    // else {
    //   r = 40;
    // }


    var x = Math.cos(i / m * 2 * Math.PI) * 200 + width_1 / 2 + Math.random();
    var y = Math.sin(i / m * 2 * Math.PI) * 200 + height_1 / 2 + Math.random();
    // console.log(x);
    // console.log(y);
    d.x = x;
    d.y = y;
    d.cluster = i;
    d.radius = r;

    var tweet_text = d.text;
    new_d = {cluster: i, radius: r, text: tweet_text, x: x, y: y, tweet_id : d.tweet_id};
    // console.log(new_d);
    if (!clusters_vizit[i] || (r > clusters_vizit[i].radius)) clusters_vizit[i] = new_d;
  });


	var force_vizit = d3.layout.force()
    	.nodes(tweets)
    	.size([width_1, height_1])
    	.gravity(.01)
    	.charge(0)
    	.on("tick", tick_vizit)
    	.start();

	var svg_vizit = d3.select("#not_gender_d3").append("svg").attr("id", "svg_vizit")
  //var svg = d3.select("body").append("svg")
    	.attr("width", width_1)
    	.attr("height", height_1);


  var circle_vizit = svg_vizit.selectAll("#circle_vizit")
      .data(tweets)
      .enter().append("circle")
      .attr("id", "circle_vizit")
      .attr("r", function(d) { return d.radius; })
      .style("fill", function(d) { return color(d.cluster); })
      .call(force_vizit.drag);
     




	function tick_vizit(e) {

  		circle_vizit
      	.each(cluster_vizit(10 * e.alpha * e.alpha))
      	.each(collide_vizit(.5))
      	.attr("cx", function(d) { return d.x; })
      	.attr("cy", function(d) { return d.y; });
	}

  function cluster_vizit(alpha) {
      return function(d) {
        var cluster = clusters_vizit[d.cluster];
        // console.log(clusters);
        // console.log(d.cluster);
        // console.log(cluster);
        // var cluster = 1;
        if (cluster === d) return;
        // console.log(d);
        // console.log(cluster);
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
	function collide_vizit(alpha) {
  		var quadtree = d3.geom.quadtree(tweets);
  		return function(d) {
    		var r = 12 + 12 + Math.max(padding_vizit, clusterPadding_vizit),
        	nx1 = d.x - r,
        	nx2 = d.x + r,
        	ny1 = d.y - r,
        	ny2 = d.y + r;
    		quadtree.visit(function(quad, x1, y1, x2, y2) {
      			if (quad.point && (quad.point !== d)) {
        			var x = d.x - quad.point.x,
            		y = d.y - quad.point.y,
            		l = Math.sqrt(x * x + y * y),
            		r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding_vizit : clusterPadding_vizit);
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

    var index_elem = d3.select("#svg_vizit").append("g").attr("id", "index_elem");

    var color_index_data = [{"text": "positive", "y": 40}, {"text": "negative", "y": 80}, {"text":"neutral", "y": 120}];
    var color_index = d3.select("#svg_vizit").append("g").attr("id", "color_index");
    color_index.append("text").text("Color of circle").attr({x:100, y: 20, "text-anchor":"middle"}).attr("font-size", "11px");
    color_index.append("text").text("indicates sentiment").attr({x:100, y: 32, "text-anchor":"middle"}).attr("font-size", "11px");
    color_index.selectAll("circle").data(color_index_data).enter().append("circle")
      .attr({cx:100, cy: function(d) {return 20+d.y}, r: maxRadius_vizit})
      .style({fill: function(d, i) {return color(i)}});

    // var size_index_data = [{"text": ">1000", "y": 10}, {"text": "500-1000", "y": 20}, {"text":"<500", "y": 50}];
   index_elem.append("text").text("Size of circle indicates").attr({x:100,y:height_1-164,"text-anchor":"middle"}).attr("font-size", "11px");
   // here can have wether it's favorites or number of retweets based on what user selects from the menu
   index_elem.append("text").attr("id", "subj").text("subjectivity").attr({x:100,y:height_1-148,"text-anchor":"middle"}).attr("font-weight", "bold").attr("font-size", "11px")
    .on("click", function (d) {
      d3.select(this).attr("font-weight", "bold");
   

      d3.select("#big-circle-value").text("1.0");
      d3.select("#medium-circle-value").text("0.5");
      d3.select("#small-circle-value").text("0.0");


      d3.selectAll("#circle_vizit").attr("r", function (d) {
        // d.radius = maxRadius + maxRadius * d.sentiment.subjectivity;
        if (d.sentiment.subjectivity == 1.0) {
          d.radius = 40;
        }
        else if (d.sentiment.subjectivity == 0) {
          d.raidus = 10;
        }
        else if (d.sentiment.subjectivity < 0.5) {
          d.radius = 15;
        } else {
          d.radius = 25;
        }


        return d.radius;
      });
      force_vizit.start();
    });

  


     
   





   index_elem.selectAll("circle").data([10,20,40]).enter().append("circle")
        .attr({cx:100,cy:function(d) {return height_1-20-d},r:String}).attr("text", "index")
        .style({fill:"none","stroke-width":2,stroke:"#ccc","stroke-dasharray":"2 2"});
    index_elem.append("text").text("1.0").attr("id", "big-circle-value").attr({x:100, y: height_1-80, "text-anchor": "middle", "font-size": "12px"})
    index_elem.append("text").text("0.5").attr("id", "medium-circle-value").attr({x:100, y: height_1-45, "text-anchor": "middle", "font-size": "10px"});
    index_elem.append("text").text("0").attr("id", "small-circle-value").attr({x:100, y: height_1-28, "text-anchor": "middle", "font-size": "10px"});






  // make the ones in the visualization more specific
	$('#svg_vizit circle').tipsy({ 
        gravity: 'w', 
        html: true, 
        title: function() {
          var d = this.__data__
          if (d.text) {
            return d.text
          } 
          return ''
        }

    });


  // create an index
    // index element for circle sizes

});

})(this);

