import React, { Component } from 'react';
//import logo from './logo.svg';
import './assets/css/App.css';


function getMessagesList(){
  fetch('http://localhost:44444/messages')
  .then(function(response){
    return response.json();
  })
  .then(function(messages){
    console.log(messages);
  });
}

class MessagesList extends Component {
  render() {
    const messagesList = getMessagesList();
    return (
      <div>{messagesList}</div>
    );
  }
}

class MailApp extends Component {
  render() {
    return (
      <div className="mail-app">

        <MessagesList />
      </div>
    );
  }
}

export default MailApp;
