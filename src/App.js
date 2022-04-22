import React, { Component } from 'react';
import { Router, Route, browserHistory, Link } from '../node_modules/react-router';
var classNames = require('classnames');
var moment = require('moment');
import 'moment/locale/fr';
moment.locale('fr');
import logo from './logo.svg';
import './App.css';

const gapi = window.gapi;
const iframely = window.iframely;


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
    console.log('logged in');
    console.log(browserHistory.getCurrentLocation());
    if(browserHistory.getCurrentLocation().pathname === '/') {
      console.log('signin');
      browserHistory.push('/list/inbox');
    }
  } else {
    browserHistory.push('/');
    console.log('logged out');
  }
}

class GoogleSign extends Component {
  render() {
    return (
      <div className="GoogleSignIn">
        <button className="GoogleSignIn-button Button" onClick={handleAuthClick}>Sign-in with google</button>
      </div>
    );
  }
}

class MessageCompose extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleChange(e) {
    switch (e.target.name) {
      case 'receiver-name':
        this.setState({receiverName: e.target.value});
        break;
      case 'receiver-email':
        this.setState({receiverEmail: e.target.value});
        break;
      case 'subject':
        this.setState({subject: e.target.value});
        break;
      case 'content':
        this.setState({content: e.target.value});
        break;
      default:
        return false;
    }

  }
  handleSubmit(e) {
    e.preventDefault();
    console.log(this.state);
    var to          = 'To: "' + this.state.receiverName + '" <' + this.state.receiverEmail + '>';
    var from        = 'From: "' +  gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getName() + '" <' + gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getEmail() + '>';
    var subject     = 'Subject: ' + this.state.subject;
    var contentType = 'Content-Type: text/plain; charset=utf-8';
    var mime        = 'MIME-Version: 1.0';

    var message = "";
    message +=   to             +"\r\n";
    message +=   from           +"\r\n";
    message +=   subject        +"\r\n";
    message +=   contentType    +"\r\n";
    message +=   mime           +"\r\n";
    message +=    "\r\n"        + this.state.content;

    this.sendMessage(message);

  }
  sendMessage(message) {
    var base64EncodedEmail = btoa(message).replace(/\+/g, '-').replace(/\//g, '_');
    gapi.client.gmail.users.messages.send({
      'userId': 'me',
      'resource': {
        'raw': base64EncodedEmail
      }
    })
    .then((result) => {
      console.log(result);
      browserHistory.push('/list/sent')
    });
  }
  render() {
    return (
      <main className="Message">

        <div className="MessageContainer">
          <form onSubmit={this.handleSubmit} className="MessageComposeForm">
            <div className="MessageContainer-header">
              <div className="MessageContainer-header-top">
                <div className="Receiver">
                  <h2 className="Receiver-title">To</h2>
                  <div className="Receiver-name">
                    <input type="text" name="receiver-name" className="Receiver-name-input Message-input" placeholder="Name" onChange={this.handleChange}/>
                  </div>
                  <div className="Sender-email">
                    <input type="text" name="receiver-email" className="Receiver-email-input Message-input" placeholder="E-mail" onChange={this.handleChange}/>
                  </div>
                </div>

              </div>
            </div>
            <div className="MessageContainer-header-bottom">
              <div className="Subject">
                <input type="text" name="subject" className="Subject-input Message-input" placeholder="Subject" onChange={this.handleChange}/>
              </div>
            </div>
            <div className="MessageContainer-content">


              <textarea name="content" className="Content-input Message-input" placeholder="Your content" onChange={this.handleChange} ></textarea>

            </div>
            <div className="MessageContainer-footer">
              <input type="submit" className="Button" value="Envoyer" />
            </div>
          </form>
        </div>
      </main>
    );
  }

}

class Message extends Component {
  constructor() {
    super();

    this.state = {
      message : {},
      messageLoaded: false
    }
  }
  componentDidMount() {
    this.getMessage(this.props.params.messageId)
    .then((messageObject) => {
      return this.formatMessageObject(messageObject);
    })
    .then((formattedMessage) => {
      this.setState({message: formattedMessage, messageLoaded: true});
      console.log(formattedMessage);
      if(formattedMessage.unread) {
        this.removeUnread(formattedMessage.id);
      }
    });
    window.iframely && iframely.load();
  }
  getIframelyHtml() {
    return {__html: this.getMessageContent()};
  }
  removeUnread(messageId) {
    return gapi.client.gmail.users.messages.modify({
      'userId': 'me',
      'id': messageId,
      'removeLabelIds': ['UNREAD']
    })
    .then(() => {
      return true;
    })
  }
  getMessage(messagesId) {
    return gapi.client.gmail.users.messages.get({
      'userId': 'me',
      'id': messagesId,
    })
    .then(messageResult => {
      return messageResult.result;
    });
  }
  formatMessageObject(messageObject) {
      const formattedMessage = messageObject;
      formattedMessage.headers = messageObject.payload.headers.reduce(function(messageHeaders, header) {
        messageHeaders[header.name.toLowerCase()] = header.value;
        return messageHeaders;
      }, {});
      if(messageObject.labelIds.indexOf('UNREAD') > -1){
        formattedMessage.unread = true;
      }
      return formattedMessage;
  }
  getSender() {
    let value = this.state.message.headers.from.split(' <');
    let sender = {};
    sender.name = value[0];
    sender.email = '<' + value[1];
    return sender;
  }
  getMessageContent() {
    let htmlContent;
    if(this.state.message.payload.body.size === 0){
      console.log(this.state.message.payload.parts);
      if(this.state.message.payload.parts[1].body !== undefined){
        htmlContent = this.b64DecodeUnicode(this.state.message.payload.parts[1].body.data.replace(/-/g, '+').replace(/_/g, '/'));
      } else {
        htmlContent = this.b64DecodeUnicode(this.state.message.payload.parts[0].body.data.replace(/-/g, '+').replace(/_/g, '/'));
      }
    } else {
      htmlContent = this.b64DecodeUnicode(this.state.message.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    }
    return htmlContent;
  }
  b64DecodeUnicode(str) {
    return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  }
  render() {
    if(!this.state.messageLoaded) {
      return null;
    }
    return (
      <main className="Message">
        <div className="MessageContainer">
          <div className="MessageContainer-header">
            <div className="MessageContainer-header-top">
              <div className="Sender">
                <div className="Sender-name">
                  {this.getSender().name}
                </div>
                <div className="Sender-email">
                  {this.getSender().email}
                </div>
              </div>
              <div className="ReplyTo">
                <button type="button" name="button" className="ReplyTo-button Button">Reply to</button>
              </div>
            </div>
          </div>
          <div className="MessageContainer-header-bottom">
            <div className="Subject">
              {this.state.message.headers.subject}
            </div>
          </div>
          <div className="MessageContainer-content">


            <div dangerouslySetInnerHTML={this.getIframelyHtml()} />

          </div>
        </div>
      </main>
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
    let that = this;
    var MessageLineClasses = classNames(
      'MessageLine',
      {
        'unread': that.props.unread,
      }
    );
    return (
      <div className={MessageLineClasses}>
        <div className="MessageLine-select">
          <input type="checkbox" className="MessageLine-select-input" />
        </div>
        <div className="MessageLine-content">
          <span className="MessageLine-sender">{this.props.headers.from.name}</span>
          <span className="MessageLine-subject">{this.props.headers.subject}</span>
          <span className="MessageLine-date">{this.formatDate(this.props.headers.date)}</span>
        </div>
      </div>
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
    this.setStateMessages(this.props.params.listType);
  }
  componentWillReceiveProps(nextProps) {
    this.setStateMessages(nextProps.params.listType);
  }
  setStateMessages(listType) {
    this.getMessagesList(listType).then((messages) => {
      console.log(messages);
      this.setState({messages: messages});
      console.log(this.state);
    });
  }
  displayMessage(id) {
    return () => {
      console.log('display');
      browserHistory.push('/message/'+ id);
    }
  }
  displayMessagesList() {
    var messageLines = this.state.messages.map(function(message, index) {
      return <Link to={'/message/'+ message.id} key={index}><MessageLine {...message} key={message.id} /></Link>;
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
          'id': message.id,
          'format': 'metadata'
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
      if(messageObject.labelIds.indexOf('UNREAD') > -1){
        formattedMessage.unread = true;
      }
      return formattedMessage;
    });
  }
  getMessagesList(listType) {
    return this.getMessagesIds(listType.toUpperCase(), 20)
    .then((messagesIds) => {
        return this.getMessages(messagesIds);
    })
    .then((messagesObjects) => {
      return this.formatMessagesObjects(messagesObjects);
    });
  }
  render() {
    return (
        <main className="MessagesList">
              {this.displayMessagesList()}
        </main>
    );
  }
}

class MailCategories extends Component {
  render() {
    return (
      // <nav className="MailCategories">
      //   <div className="MailCategories-group">
      //     <a href="#" className="MailCategories-link">Primary (1)</a>
      //     <a href="#" className="MailCategories-link">Social</a>
      //     <a href="#" className="MailCategories-link">Promotions</a>
      //   </div>
      //   <div className="MailCategories-group">
      //     <a href="#" className="MailCategories-link">Starred</a>
      //     <a href="#" className="MailCategories-link">Sent emails</a>
      //     <a href="#" className="MailCategories-link">Drafts</a>
      //   </div>
      //   <div className="MailCategories-group">
      //     <a href="#" className="MailCategories-link">Spam</a>
      //     <a href="#" className="MailCategories-link">Bin</a>
      //   </div>
      // </nav>
      <nav className="MailCategories">
        <div className="MailCategories-group">
          <Link to="/list/inbox" className="MailCategories-link inbox" activeClassName="active">Inbox</Link>
          <Link to="/list/sent" className="MailCategories-link sent" activeClassName="active">Sent</Link>
        </div>
        <div className="MailCategories-group">
          <a href="#" className="MailCategories-link">Starred</a>
          <a href="#" className="MailCategories-link">Sent emails</a>
          <a href="#" className="MailCategories-link">Drafts</a>
        </div>
        <div className="MailCategories-group">
          <a href="#" className="MailCategories-link">Spam</a>
          <a href="#" className="MailCategories-link">Bin</a>
        </div>
      </nav>
    );
  }
}

class HeadingToolbar extends Component {
  render() {
    var headingToolbarMain;
    if(this.props.headingToolbarType === 'list') {
      headingToolbarMain =
        <div className="HeadingToolbar-column AppColumn main row">
          <div className="HeadingToolbar-selectAll">
            <input type="checkbox" name="SelectAll" />
          </div>
          <div className="HeadingToolbar-paging Paging">
            <span className="Paging-actualMessages">
              1 - 50
            </span>
            <span className="Paging-of">&nbsp;of&nbsp;</span>
            <span className="Paging-totalMessages">90</span>
            <nav className="Paging-PagingNav Paging-nav">
              <a href="#" className="PagingNav-prev">&lt;</a>
              <a href="#" className="PagingNav-next">&gt;</a>
            </nav>
          </div>
        </div>;
    } else {
      headingToolbarMain =
        <div className="HeadingToolbar-column AppColumn main row">
          <div className="HeadingToolbar-goBack">
            <button type="button" name="back" className="HeadingToolbar-goBack-button Button" onClick={browserHistory.goBack}></button>
          </div>
          <div className="HeadingToolbar-paging Paging">
            <span className="Paging-actualMessages">
              1 - 50
            </span>
            <span className="Paging-of">&nbsp;of&nbsp;</span>
            <span className="Paging-totalMessages">90</span>
            <nav className="Paging-PagingNav Paging-nav">
              <a href="#" className="PagingNav-prev">&lt;</a>
              <a href="#" className="PagingNav-next">&gt;</a>
            </nav>
          </div>
        </div>;
    }

    console.log(this.props);
    return (
      <section className="HeadingToolbar Wrapper">
        <div className="AppColumn left">
          <Link to="/compose" className="HeadingToolbar-composeEmail Button action">
            Compose
          </Link>
        </div>
        {headingToolbarMain}
      </section>
    );
  }
}

class Account extends Component {
  constructor() {
    super();
    this.state = {
      account: {}
    }
  }
  componentDidMount() {
    const account = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
    this.setState({account: account});
  }
  getImgUrl() {
    return gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getImageUrl();
  }
  getUserName() {
    return gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getName();
  }
  getUserEmail() {
    return gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getEmail();
  }
  signOut() {
    gapi.auth2.getAuthInstance().signOut();
  }
  render() {
    return (
      <div className="Account">
        <img src={this.getImgUrl()} alt="Account" className="Account-image" />
        <div className="Account-perso Perso">
          <div className="Perso-name">
            {this.getUserName()}
          </div>
          <div className="Perso-email">
            {this.getUserEmail()}
          </div>
          <a className="Perso-signout" href="#" onClick={this.signOut}>Sign out</a>
        </div>
      </div>
    );
  }
}

class Headbar extends Component {
  render() {
    var isLoggedInContent = ' ';
    if(this.props.isLoggedIn) {
      isLoggedInContent =
        <div className="AppColumn main row">
          <div className="Headbar-searchbar">
            <input type="text" className="Searchbar" />
          </div>
          <div className="Headbar-account">
            <Account />
          </div>
        </div>;
    }


    return (
      <header className="Headbar Wrapper">
        <div className="AppColumn left">
          <div className="Headbar-logo Logo">
            <div className="Logo-icon">
              <img src={logo} alt="Logo"/>
            </div>
            <h1 className="Logo-text">
              FMail
            </h1>
          </div>
        </div>
        {isLoggedInContent}
      </header>

    );
  }
}

class MailApp extends Component {
  constructor() {
    super();
    this.state = {
        googleAPILoading: true,
        scriptFetched: false
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
      <Route path="/" component={GoogleSign} />
      <Route path="/list/:listType" component={MessagesList} />
      <Route path="/message/:messageId" component={Message} />
      <Route path="/compose" component={MessageCompose} />
    </Route>
  </Router>
);

export default Routes;
