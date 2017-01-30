var fs = require('fs');

var GlobalAuth  = (function(){
  var self = {};
  var CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URL,
      oauth2Client;

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
      CLIENT_ID = credentials.installed.client_id;
      CLIENT_SECRET = credentials.installed.client_secret,
      REDIRECT_URL = credentials.installed.redirect_uris[0];
      if(err === null){
        result = true;
      } else {
        result = false;
      }
      callback(result);
    });
  }

  function setNewAuth(){
    oauth2Client = new OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URL
    );
  }

  self.getAuthUrl = function() {
    // generate a url that asks permissions for Google+ and Google Calendar scopes
    var scopes = [
      'https://www.googleapis.com/auth/plus.me',
      'https://www.googleapis.com/auth/calendar'
    ];

    var url = oauth2Client.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: 'online',
      // If you only need one scope you can pass it as string
      scope: scopes
    });

    return url;
  }

  return self;
})();

module.exports = GlobalAuth;
