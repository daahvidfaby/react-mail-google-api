var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var googleAuth = require('google-auth-library');
var qs = require('querystring');
var url = require('url');
const util = require('util');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
// var GlobalAuth = require('./modules/GlobalAuth');


var app = new express();
app.use(bodyParser.json());


app.listen(44444);

app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

console.log('Server launched');

app.get('/getauthurl', function(req, res){
  res.write(GlobalAuth.getAuthUrl());
  res.end();
});

app.get('/?', function(req, res) {
  console.log(req.query.code);
  console.log('ok');
  var code = req.query.code;
  console.log(util.inspect(GlobalAuth.oauth2Client, {showHidden: false, depth: null}));

  /*
  GlobalAuth.oauth2Client.getToken(req.query.code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      GlobalAuth.oauth2Client.credentials = token;
      console.log(token);

  });
  */
});

var GlobalAuth  = (function(){
  var self = {};
  var CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URL;

  self.init = function() {
    var promise = new Promise(function(resolve, reject) {
      var file = 'client_secret.json';
      getFileCredentials(file, function(result) {
        if (result === true) {
          resolve();
        } else {
          reject(Error('Le fichier' + file + 'n\'a pas pu être lu'));
        }
      });
    });

    promise.then(setNewAuth, function(err) {
      console.log(err);
    });
  }

  function getFileCredentials(file, callback) {
    fs.readFile(file, function processClientSecrets(err, content){
      var credentials = JSON.parse(content),
          result;
      CLIENT_ID = credentials.web.client_id;
      CLIENT_SECRET = credentials.web.client_secret,
      REDIRECT_URL = credentials.web.redirect_uris[0];
      if(err === null){
        result = true;
      } else {
        result = false;
      }
      callback(result);
    });
  }

  function setNewAuth(){
    self.oauth2Client = new OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URL
    );
  }

  self.getAuthUrl = function() {
    // generate a url that asks permissions for Google+ and Google Calendar scopes
    var scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.compose',
    ];

    var url = self.oauth2Client.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: 'online',
      // If you only need one scope you can pass it as string
      scope: scopes
    });

    return url;
  }

  return self;
})();

GlobalAuth.init();
