//Pattern:
//http://example.com/api/users?id=4&token=sdfa3&geo=us
//http://localhost:8080/blacktip/measurements?id=wSVuDv51X4Xxn4K2hncytcfG3n43&tank=-KTeoKM5GO2yVjAy-7lg&name=CurrTemp&val=99.9


// grab the packages we need
var express = require('express');
var app = express();
var port = process.env.PORT || 8070;

var firebase = require("firebase");
var google = require('googleapis');
var bigquery = google.bigquery('v2');
var BigQuery = require('@google-cloud/bigquery');



firebase.initializeApp({
  serviceAccount: "blacktip-64c0d86ef0d1.json",
  databaseURL: "https://sixth-tempo-89216.firebaseio.com"
});

app.listen(port);
console.log('Server started! At http://localhost:' + port);
app.get('/blaktip/measurements', function(req, res) {
  var user_id = req.param('id');
  var tank_id = req.param('tank');
  var  name = req.param('name');
  var value = req.param('val');

  var subString = '/tanks/'+user_id+'/'+tank_id+'/'+name+'='+value;
  console.log(subString);
// -------START : Post To Firebase------------
  var usersRef = firebase.database().ref().child("tanks");
  var thisUserRef = usersRef.child(user_id);
  // var tanksRef = thisUserRef.child("tanks");
  var thisTank = thisUserRef.child(tank_id);
  var updateObj = {};
  updateObj[name] = value;
  thisTank.update(updateObj); //Post to FB here
//-------END : Post to Firebase--------

//-------START : Post to BigQuery-------------
google.auth.getApplicationDefault(function(err, authClient) {
  //S:AUTH
  if (err) {
    console.log('Authentication failed because of ', err);
    return;
  }
  if (authClient.createScopedRequired && authClient.createScopedRequired()) {
    var scopes = ['https://www.googleapis.com/auth/cloud-platform'];
    authClient = authClient.createScoped(scopes);
  }
  //E:AUTH

  var timestamp = new Date();

  var time = new Date().getTime();
  var date = new Date(time);
  var dateStr = date.toString();
  /* Setup request */
  var request = {
  projectId: "sixth-tempo-89216",
  datasetId: "measurements",
  tableId: "stream",
  auth: authClient,
  resource: {
      "rows": [{    
           "json": {
              uId: user_id,
              containerId: tank_id,
              type: name,
              value: value,
              timestamp: time.toString()
            }
        }]
    }
  };
  //E:REquest setup

  var bigquery2 = BigQuery();
  bigquery.tabledata.insertAll(request, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
      var sqlQuery = 'SELECT\n' +
                 ' * \n' +
                 'FROM `sixth-tempo-89216.measurements.stream`;';

      var options = {query: sqlQuery, useLegacySql: false};
      bigquery2.query(options, function (err, rows) {
          if (err) {
            return console.log(err.toString());
          }
      });
    } //E:ELSE
  }); //E:BIGQuery

//-------END : Post to BigQuery-------------

 res.send(subString);

});

});


// function printExample (rows) {
//   console.log('Query Results:');
//   rows.forEach(function (row) {
//     var str = '';
//     for (var key in row) {
//       if (str) {
//         str += '';
//       }
//       str += key + ': ' + row[key]+'/';
//     }
//     console.log(str+'\n');
//   });
// }