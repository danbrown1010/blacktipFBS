//var connect = require('connect');

//Pattern:
//http://example.com/api/users?id=4&token=sdfa3&geo=us
//http://localhost:8080/blacktip/measurements?id=wSVuDv51X4Xxn4K2hncytcfG3n43&tank=-KTeoKM5GO2yVjAy-7lg&name=CurrTemp&val=99.9


// grab the packages we need
var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var firebase = require("firebase");



firebase.initializeApp({
  serviceAccount: "blacktip-64c0d86ef0d1.json",
  databaseURL: "https://sixth-tempo-89216.firebaseio.com"
});

//user = wSVuDv51X4Xxn4K2hncytcfG3n43
//tankId = -KTel1Y20m-3yhdCjsZ2

var rootRef = firebase.database().ref();
var tanksRef = rootRef.child("tanks");


console.log('Resetting current temp in database!')

rootRef.update({
  measurements: {
  	wSVuDv51X4Xxn4K2hncytcfG3n43: {
  		'-KTeoKM5GO2yVjAy-7lg': {
  			currentTemp: "--"
  		}
  	}
  }
});


app.listen(port);
console.log('Server started! At http://localhost:' + port);
// routes will go here
app.get('/blacktip/measurements', function(req, res) {
  var user_id = req.param('id');
  var tank_id = req.param('tank');
  var  name = req.param('name');
  var value = req.param('val');

  console.log(user_id + ' ' + tank_id + ' ' + name + '=' + value);

  var subString = '{"measurements": {"'+user_id+'": {"'+tank_id+'": {"'+name+'": '+value+'}}}}';

  console.log(subString);
  rootRef.update({
  measurements: {
  	wSVuDv51X4Xxn4K2hncytcfG3n43: {
  		'-KTeoKM5GO2yVjAy-7lg': {
  			currentTemp: value
  		}
  	}
  }
  });
  res.send(subString);

});

