var dataset;

var color = d3.scale.category20b();

d3.json("../sample_users.json", function(json) {

    dataset = json;




	var svgContainer = d3.select("body").append("svg").attr("width", 500).attr("height", 100);
	var svg = d3.select("svg");
	var circle = svg.selectAll("circle").data(dataset.users);
	var circleEnter = circle.enter().append("circle");
	circleEnter.attr("fill", function(d) {
		if (d.gender == "female") return "lightcoral";
		return "steelblue";
	});
	circleEnter.attr("cy", 60);
	circleEnter.attr("cx", function (d, i) {return i * 100 + 30; });
	circleEnter.attr("r", function (d) { return d.age;});


	 $('svg circle').tipsy({ 
        gravity: 'w', 
        html: true, 
        title: function() {
          var d = this.__data__, name = d.name, age = d.age, gender = d.gender;
          return name; 
        }

      });



});






