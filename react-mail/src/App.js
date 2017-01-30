import React, { Component } from 'react';
import { Router, Route } from '../node_modules/react-router';

//import logo from './logo.svg';
import './assets/css/App.css';

function getMessagesList(){
  /*
  fetch('http://localhost:44444/messages')
  .then(function(response){
    return response.json();
  })
  .then(function(messages){
    console.log(messages);
  });
  */
}


class MessagesList extends Component {
  render() {
    const messagesList = getMessagesList();
    return (
      <div>{messagesList}</div>
    );
  }
}

class GoogleSign extends Component {
  render() {
    return (
      <button id="googleSignIn">Sign-in with google</button>
    );
  }
}

class MailApp extends Component {
  render() {
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
      <Route path="/message" component={MessagesList} />
    </Route>
  </Router>
);

export default Routes;
