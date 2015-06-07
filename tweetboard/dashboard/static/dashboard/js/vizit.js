// notes:
// add an index
// change radius based on something
// color code more effectively based on something else


// d3.json("/api/get_users_retweet_by_original_user?user_id=Hillary Clinton", function(error, json)


var tweets;

var padding = 1.5, // separation between same-color circles
    clusterPadding = 6, // separation between different-color circles
    maxRadius = 12;

// var width = $('#top_d3js_box').width();
// var height = $('#top_d3js_box').height();

var width = 950;
var height = 500;

d3.json("/api/get_tweets_by_user_id?user_id=HillaryClinton", function(data) {

  // console.log(error);
	tweets = data.tweets;
  // console.log(users);


 //  var n = hashtags.length; // a circle for each hashtag
	// var m = 4; // number of distinct clusters, 0-100 retweets is cluster 1, 100-500 is cluster 2, 500-1000 is cluster 3
	// 			// anything above 1000 is cluster 4

  var m = 3;
	var color = d3.scale.category10().domain(d3.range(m));

	// The largest node for each cluster.
	var clusters = new Array(m);


  tweets.forEach(function(d) {

    // console.log(d);
    var i = 0;
    if (d.sentiment.polarity < 0) {
      i = 1;
    } else if (d.sentiment.polarity == 0) {
      i = 2;
    }

    // console.log(d.sentiment.polarity);

    // var r = maxRadius + maxRadius * d.sentiment.subjectivity;
    var r = 25;
    if (d.sentiment.subjectivity == 1.0) {
      r = 50;
    }
    else if (d.sentiment.subjectivity == 0) {
      r = 10;
    }
    else if (d.sentiment.subjectivity < 0.5) {
      r = 15;
    }
    var x = Math.cos(i / m * 2 * Math.PI) * 200 + width / 2 + Math.random();
    var y = Math.sin(i / m * 2 * Math.PI) * 200 + height / 2 + Math.random();
    // console.log(x);
    // console.log(y);
    d.x = x;
    d.y = y;
    d.cluster = i;
    d.radius = r;
    var tweet_text = d.text;
    new_d = {cluster: i, radius: r, text: tweet_text, x: x, y: y};
    // console.log(new_d);
    if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = new_d;
  });


	var force = d3.layout.force()
    	.nodes(tweets)
    	.size([width, height])
    	.gravity(.01)
    	.charge(0)
    	.on("tick", tick)
    	.start();

	// var svg = d3.select("#top_d3js_box").append("svg")
  var svg = d3.select("body").append("svg")
    	.attr("width", width)
    	.attr("height", height);


  var circle = svg.selectAll("circle")
      .data(tweets)
      .enter().append("circle")
      .attr("id", "tweet_circle")
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
	function collide(alpha) {
  		var quadtree = d3.geom.quadtree(tweets);
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

    var index_elem = d3.select("svg").append("g").attr("id", "index_elem");

    var color_index_data = [{"text": "positive", "y": 40}, {"text": "negative", "y": 80}, {"text":"neutral", "y": 120}];
    var color_index = d3.select("svg").append("g").attr("id", "color_index");
    color_index.append("text").text("Color of circle").attr({x:100, y: 20, "text-anchor":"middle"});
    color_index.append("text").text("indicates sentiment").attr({x:100, y: 32, "text-anchor":"middle"});
    color_index.selectAll("circle").data(color_index_data).enter().append("circle")
      .attr({cx:100, cy: function(d) {return 20+d.y}, r: maxRadius})
      .style({fill: function(d, i) {return color(i)}});

    // var size_index_data = [{"text": ">1000", "y": 10}, {"text": "500-1000", "y": 20}, {"text":"<500", "y": 50}];
   index_elem.append("text").text("Size of circle indicates").attr({x:100,y:height-160,"text-anchor":"middle"});
   // here can have wether it's favorites or number of retweets based on what user selects from the menu
   index_elem.append("text").attr("id", "subj").text("subjectivity").attr({x:100,y:height-148,"text-anchor":"middle"}).attr("font-weight", "bold")
    .on("click", function (d) {
      d3.select(this).attr("font-weight", "bold");
      d3.select("#fav").attr("font-weight", "normal");
      d3.select("#retweet").attr("font-weight", "normal");
      d3.selectAll("#tweet_circle").attr("r", function (d) {
        // d.radius = maxRadius + maxRadius * d.sentiment.subjectivity;
        if (d.sentiment.subjectivity == 1.0) {
          d.radius = 50;
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
      force.start();
    });

    index_elem.append("text").attr("id", "fav").text("favorites").attr({x:100,y:height-138,"text-anchor":"middle"})
    .on("click", function (d) {
      d3.select(this).attr("font-weight", "bold");
      d3.select("#subj").attr("font-weight", "normal");
      d3.select("#retweet").attr("font-weight", "normal");
      d3.selectAll("#tweet_circle").attr("r", function (d) {
        // console.log(d);
        // console.log(Math.log(d.favorite_count + 1));
        // d.radius = maxRadius + Math.log(d.favorite_count + 1);
        if (d.favorite_count < 100) {
          d.radius = 10;
        }
        else if (d.favorite_count < 500) {
          d.radius = 20;
        }
        else {
          d.favorite_count = 50;
        }
        return d.radius;
      });



      d3.select("#big-circle-value").text(">500 favorites");
      d3.select("#medium-circle-value").text("100-500 favorites");
      d3.select("#small-circle-value").text("<100 favorites");
      //   return d.radius;
      // });
      force.start();
    });

    index_elem.append("text").attr("id", "retweet").text("retweets").attr({x:100,y:height-128,"text-anchor":"middle"})
    .on("click", function () {
      d3.select(this).attr("font-weight", "bold");
      d3.select("#fav").attr("font-weight", "normal");
      d3.select("#subj").attr("font-weight", "normal");
      d3.selectAll("#tweet_circle").attr("r", function (d) {
        // d.radius = maxRadius + Math.log(d.retweet_count + 1);
        if (d.retweet_count < 100) {
          d.radius = 10;
        }
        else if (d.retweet_count < 500) {
          d.radius = 20;
        }
        else {
          d.radius = 50;
        }
        return d.radius;
      });

      d3.select("#big-circle-value").text(">500 retweets");
      d3.select("#medium-circle-value").text("100-500 retweets");
      d3.select("#small-circle-value").text("<100 retweets");

      force.start();
    });
   





   index_elem.selectAll("circle").data([10,20,50]).enter().append("circle")
        .attr({cx:100,cy:function(d) {return height-20-d},r:String}).attr("text", "index")
        .style({fill:"none","stroke-width":2,stroke:"#ccc","stroke-dasharray":"2 2"});
    index_elem.append("text").text("1.0").attr("id", "big-circle-value").attr({x:100, y: height-80, "text-anchor": "middle", "font-size": "12px"})
    index_elem.append("text").text("0.5").attr("id", "medium-circle-value").attr({x:100, y: height-45, "text-anchor": "middle", "font-size": "10px"});
    index_elem.append("text").text("0").attr("id", "small-circle-value").attr({x:100, y: height-28, "text-anchor": "middle", "font-size": "10px"});




    // creating radio buttons
    // var radio_buttons = d3.select("svg").append("g").attr("id", "radio_button_elem");

    // var select_by = ["subjectivity", "favorites", "retweets"], 
    // j = 0;  // Choose the star as default

    // // Create the shape selectors
    // var form = radio_buttons.append("form").attr({x: 100, y: height-80});

    // var labelEnter = form.selectAll("span")
    //   .data(select_by)
    //   .enter().append("span").attr({x: 100, y: height-300});

    // labelEnter.append("input")
    //   .attr({
    //     type: "radio",
    //     class: "shape",
    //     name: "mode",
    //     value: function(d, i) {return i;}
    // })
    // .property("checked", function(d, i) { 
    //     return (i===j); 
    // });

    // labelEnter.append("label").text(function(d) {return d;});



  // make the ones in the visualization more specific
	$('svg circle').tipsy({ 
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
