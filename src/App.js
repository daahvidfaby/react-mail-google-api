import React, { Component } from 'react';
import { Router, Route, browserHistory } from 'react-router';
var moment = require('moment');
import 'moment/locale/fr';
moment.locale('fr');
import './App.css';
import GoogleSignIn from './Components/GoogleSignIn';
import Message from './Components/Message';
import MessageCompose from './Components/MessageCompose';
import MessagesList from './Components/MessageList';
import MailCategories from './Components/MailCategories';
import HeadingToolbar from './Components/HeadingToolbar';
import Headbar from './Components/Headbar';

const gapi = window.gapi;


// Client ID and API key from the Developer Console
var CLIENT_ID = '345060820385-g40i755r2pslhiekg5amgrnitiigp6r6.apps.googleusercontent.com';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = 'https://mail.google.com/';

function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    if(browserHistory.getCurrentLocation().pathname === '/') {
      browserHistory.push('/list/inbox');
    }
  } else {
    browserHistory.push('/');
  }
}



class MailApp extends Component {
  constructor() {
    super();
    this.state = {
        googleAPILoading: true,
    }
  }
  componentDidMount() {
    let loadingInterval = setInterval(() => {
      if(gapi) {
        gapi.load('client:auth2', () => {
          this.initClient()
        });
        clearInterval(loadingInterval);
      }
    }, 100)
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
    var isLoggedIn = false;
    if(this.props.location.pathname !== '/') {
      isLoggedIn = true;
    }

    var headingToolbarType;
    if(this.props.params.listType !== undefined) {
      headingToolbarType = 'list';
    }

    var isLoggedInToolbar = null,
        isLoggedInLeftColumn = null;
    if(isLoggedIn){
      isLoggedInToolbar = <HeadingToolbar headingToolbarType={headingToolbarType}/>;
      isLoggedInLeftColumn =
      <div className="AppColumn left">
        <MailCategories />
      </div>;
    }



    return (
      <div className="AppContainer">
        <Headbar isLoggedIn={isLoggedIn}/>
        {isLoggedInToolbar}

        <section className="MainSection Wrapper no-right">
          {isLoggedInLeftColumn}

          <div className="AppColumn main">

                {this.props.children}

          </div>

        </section>

      </div>
    );
  }
}


const Routes = (props) => (
  <Router {...props}>
    <Route component={MailApp}>
      <Route path="/" component={GoogleSignIn} />
      <Route path="/list/:listType" component={MessagesList} />
      <Route path="/message/:messageId" component={Message} />
      <Route path="/compose" component={MessageCompose} />
    </Route>
  </Router>
);

export default Routes;
