

var user;


d3.json("/api/get_user_by_id?user_id=HillaryClinton", function(data) {

  user = data.user;
  console.log(user);
  var text = "friends: " + user.friends_count + " followers: " + user.followers_count;
  console.log(text);
  var svgContainer = d3.select("body").append("svg").attr("width",300).attr("height",200);
  var textObj = svgContainer.append("text");

  var textLabels = textObj
    .attr("x", 10)
    .attr("y", 30)
    .text(text)
    .attr("font-family", "sans-serif")
    .attr("font-size", "20px")
    .attr("fill", "steelblue");

});