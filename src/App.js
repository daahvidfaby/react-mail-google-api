import React, { Component } from 'react';
import { Router, Route, browserHistory } from '../node_modules/react-router';
// import Moment from 'react-moment';
var moment = require('moment');
import 'moment/locale/fr';
moment.locale('fr');
import logo from './logo.svg';
import './App.css';
import './assets/js/gapi';
const gapi = window.gapi;


// Client ID and API key from the Developer Console
var CLIENT_ID = '345060820385-g40i755r2pslhiekg5amgrnitiigp6r6.apps.googleusercontent.com';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = 'https://mail.google.com/';


function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    browserHistory.push('/inbox');
    console.log('logged in');
  } else {
    browserHistory.push('/');
    console.log('logged out');
  }
}

class GoogleSign extends Component {
  render() {
    return (
      <button id="googleSignIn" className="btn waves-effect waves-light" onClick={handleAuthClick}>Sign-in with google</button>
    );
  }
}

class MessageLine extends Component {
  formatDate(dateString) {
    let date = new Date(dateString);
    let formattedDate = moment(date.getTime()).format('D MMM');
    console.log(formattedDate);
    return formattedDate;
  }
  render() {
    return (
      <tr className="messageLine">
          <td>{this.props.headers.from.name}</td>
          <td>{this.props.headers.subject}</td>
          <td>{this.formatDate(this.props.headers.date)}</td>
      </tr>
    );
  }
}

class MessagesList extends Component {
  constructor() {
      super();
      this.state = {
          messages: [],
      }
  }
  componentDidMount() {
    this.getInbox().then((messages) => {
      console.log(messages);
      this.setState({messages: messages});
      console.log(this.state);
    });
  }
  displayMessages() {
    var messageLines = this.state.messages.map(function(message, index) {
      console.log('display');
      return <MessageLine {...message} key={index} />;
    });
    return messageLines;
  }
  getMessagesIds(label, nb) {
    return gapi.client.gmail.users.messages.list({
      'userId': 'me',
      'maxResults': nb,
      'labelIds': label
    }).then((messagesIds) => {
      return messagesIds;
    });
  }
  getMessages(messagesIds) {
    console.log(messagesIds);
    return Promise.all(
      messagesIds.result.messages.map(function(message) {
        return gapi.client.gmail.users.messages.get({
          'userId': 'me',
          'id': message.id
        }).then(function(messages) {
          return messages.result;
        })
      })
    );
  }
  formatMessagesObjects(messagesObjects) {
    return messagesObjects.map(function(messageObject) {
      const formattedMessage = messageObject;
      formattedMessage.headers = messageObject.payload.headers.reduce(function(messageHeaders, header) {
        if(header.name === 'From') {
          let value = header.value.split(' <');
          messageHeaders[header.name.toLowerCase()] = [];
          messageHeaders.from.name = value[0];
          messageHeaders.from.email = '<' + value[1];
        } else {
          messageHeaders[header.name.toLowerCase()] = header.value;
        }
        return messageHeaders;
      }, {});
      return formattedMessage;
    });
  }
  getInbox() {
    return this.getMessagesIds('INBOX', 20)
    .then((messagesIds) => {
        return this.getMessages(messagesIds);
    })
    .then((messagesObjects) => {
      return this.formatMessagesObjects(messagesObjects);
    });
  }
  render() {
    return (
      <section>
        <h2>Messages</h2>
          <table className="messageTable">
            <tbody>
              {this.displayMessages()}
            </tbody>
          </table>
      </section>

    );
  }
}

class MailApp extends Component {
  constructor() {
    super();
    this.state = {
        messages: [],
        googleAPILoading: true,
    }

  }
  componentDidMount() {
    gapi.load('client:auth2', () => {
        this.initClient()
    });
  }
  initClient() {
    gapi.client.init({
      discoveryDocs: DISCOVERY_DOCS,
      clientId: CLIENT_ID,
      scope: SCOPES
    }).then(function () {
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
      // Handle the initial sign-in state.
      return updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    }).then(() => {
        this.setState({googleAPILoading : false});
    });
  }
  render() {
    if (this.state.googleAPILoading) {
      return null;
    }
    return (
      <div className="mail-app">
        {this.props.children}
      </div>
    );
  }
}

const Routes = (props) => (
  <Router {...props}>
    <Route component={MailApp} >
      <Route path="/" component={GoogleSign} />
      <Route path="/inbox" component={MessagesList} />
    </Route>
  </Router>
);

export default Routes;
