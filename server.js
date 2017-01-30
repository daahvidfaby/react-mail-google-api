var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var oauth2Client,
    clientCode;

var app = new express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/gmail-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs-quickstart.json';
var CLIENT_ID;

app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});


app.get('/messages', function(req, res){
  // Load client secrets from a local file.
  fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      return;
    }

    // Authorize a client with the loaded credentials, then call the
    // Gmail API.
    authorize(JSON.parse(content), clientCode, function(auth) {
      console.log(auth);
      listMessage(auth, function(messages){
        console.log('fini');
        res.json((messages));
        res.end();
      });

    });
  });


});

app.post('/tokensignin', function(req, res) {
  var auth = new googleAuth;
  var client = new auth.OAuth2(CLIENT_ID, '', '');
  client.verifyIdToken(
    req.body.id_token,
    CLIENT_ID,

    function(e, login) {
      var payload = login.getPayload();
      var userid = payload['sub'];
      console.log(userid);

    });
});

app.post('/code', function(req, res) {
  clientCode = req.body.code;
  res.end();
});


app.listen(44444);




/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, code, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var CLIENT_ID = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  oauth2Client.getToken(code, function(err, token) {
    if (err) {
      console.log('Error while trying to retrieve access token', err);
      return;
    }
    oauth2Client.credentials = token;
    callback(oauth2Client);
  });

    /*
  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }

  });
  */


}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {
  var gmail = google.gmail('v1');
  gmail.users.labels.list({
    auth: auth,
    userId: 'me',
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var labels = response.labels;
    if (labels.length == 0) {
      console.log('No labels found.');
    } else {
      console.log('Labels:');
      for (var i = 0; i < labels.length; i++) {
        var label = labels[i];
        console.log('- %s', label.name);
      }
    }
  });
}

/*
function listMessages(userId, query, callback) {
  var gmail = google.gmail('v1');
  var getPageOfMessages = function(request, result) {
    request.execute(function(resp) {
      result = result.concat(resp.messages);
      var nextPageToken = resp.nextPageToken;
      if (nextPageToken) {
        request = gmail.users.messages.list({
          'userId': userId,
          'pageToken': nextPageToken,
          'q': query
        });
        getPageOfMessages(request, result);
      } else {
        callback(result);
      }
    });
  };
  var initialRequest = gmail.users.messages.list({
    'userId': userId,
    'q': query
  });
  getPageOfMessages(initialRequest, []);
}
*/

function listMessage(auth, callback) {
  var gmail = google.gmail({ auth: auth, version: 'v1' });
  var messageIds;

  gmail.users.messages.list({
    'userId': 'me',
  }, function (err, result) {
    console.log(err);
    messageIds = result.messages.map(function(e){
      return e.id;
    });
    console.log(messageIds);
    var i = 0;
    var messages = [];
    messageIds.forEach(function(elementId){
      getMessage(elementId, auth, function(message){
        console.log('message', i, messageIds.length);
        messages.push(message)
        i++;
        if(i == messageIds.length){
          callback(messages);
        }
      });
    })
  });
}

function getMessage(messageId, auth, callback) {
  var gmail = google.gmail({ auth: auth, version: 'v1' });

  gmail.users.messages.get({
    'userId': 'me',
    'id': messageId
  }, function (err, result) {
    callback(result);
  });
}
