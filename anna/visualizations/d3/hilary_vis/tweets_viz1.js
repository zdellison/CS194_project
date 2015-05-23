var dataset;

// var color = d3.scale.category20b();

d3.json("../prettified_json.json", function(json) {


	dataset = json.entities;
	favorite_count = json.favorite_count;

	var svgContainer = d3.select("body").append("svg").attr("width", 500).attr("height", 100);
	var svg = d3.select("svg");
	var circle = svg.selectAll("circle").data(dataset.hashtags);
	var circleEnter = circle.enter().append("circle");
	circleEnter.attr("fill", "steelblue");
	circleEnter.attr("cy", 60);
	circleEnter.attr("cx", function (d, i) {return i * 100 + 30; });
	circleEnter.attr("r", favorite_count / 100);
	circleEnter.attr("text", function(d) {return d.text})


	 $('svg circle').tipsy({ 
        gravity: 'w', 
        html: true, 
        title: function() {
          var d = this.__data__, user = d.text;
          return user; 
        }

      });



});


// need to format something that has json in the format of:
// hashtags {text: "blah", favorite_count: 100}, {text: "blah", favorite_count: 100}





