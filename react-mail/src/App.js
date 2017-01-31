import React, { Component } from 'react';
import { Router, Route } from '../node_modules/react-router';

import './assets/css/App.css';

function getMessagesList(){
  // NOTATION: Je t'ai corrigé ce code pour que cela fonctionne
  return fetch('http://localhost:44444/messages')
  .then(function(response){
    return response.json();
  })
}

// NOTATION: Je t'ai aidé un peu sur ce bout de code pour les promesses.
// NOTATION: On va voir les promesses ensemble au prochain cours, mais si tu veux
// te renseigner un peu, je te conseille cet article qui m'a permis de comprendre
// à quoi servent les promesses : http://andyshora.com/promises-angularjs-explained-as-cartoon.html
// un autre article intéressant qui explique pourquoi les promesses sont si cool :
// https://gist.github.com/domenic/3889970
// Il y a aussi la spécification https://www.promisejs.org/
class MessagesList extends Component {
  constructor() {
      this.state = {
          messages: [],
      }
  }
  componentDidMount() {
    getMessagesList().then((messages) => {
        this.setState({messages: messages});
    })
  }
  render() {
    return (
      <div>{messages.length}</div>
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
