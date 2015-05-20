externalFunction = function() {
  var ajax = new XMLHttpRequest();
  ajax.open("GET", '/api/init/', false);
  ajax.onreadystatechange = function() {
    if (ajax.readyState == 4 && ajax.status == 200) {
      var response = JSON.parse(ajax.responseText);
      alert('Hello, ' + response.userName + ' (@' + response.twitterHandle + ')');
      var img = document.createElement("img");
      img.src = response.userPic;
      document.body.appendChild(img)
    }
  }
  ajax.send(null);
};
