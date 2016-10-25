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

app.listen(port);
console.log('Server started! At http://localhost:' + port);
app.get('/blacktip/measurements', function(req, res) {
  var user_id = req.param('id');
  var tank_id = req.param('tank');
  var  name = req.param('name');
  var value = req.param('val');

  var subString = '/users/'+user_id+'/tanks/'+tank_id+'/'+name+'='+value;
  console.log(subString);

  var usersRef = firebase.database().ref().child("users");
  var thisUserRef = usersRef.child(user_id);
  var tanksRef = thisUserRef.child("tanks");
  var thisTank = tanksRef.child(tank_id);
  var updateObj = {};
  updateObj[name] = value;

  thisTank.update(updateObj);

  res.send(subString);
});
