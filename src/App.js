import React, {Component} from 'react';
import {Router, Route, browserHistory, Link} from '../node_modules/react-router';
import {MessagesHelper} from './helpers/messagesHelper.js';
var classNames = require('classnames');
var moment = require('moment');
import 'moment/locale/fr';
moment.locale('fr');
import logo from './logo.svg';
import './App.css';

import UserApi from './services/UserApi';

const gapi = window.gapi;
const iframely = window.iframely;




function updateSigninStatus() {
  if (UserApi.getSignInStatus() === true) {
    if (browserHistory.getCurrentLocation().pathname === '/') {
      browserHistory.push('/list/inbox');
    }
  } else {
    browserHistory.push('/');
    console.log('logged out');
  }
}

function GoogleSign() {
    return (
      <div className="GoogleSignIn">
        <button className="GoogleSignIn-button Button" onClick={UserApi.getSignInPopUp}>Sign-in with google</button>
      </div>
    );
} 

class MessageCompose extends Component {
  constructor(props) {
    super(props);
    this.state = {
      senderName: UserApi.getUserProfile().name,
      senderEmail: UserApi.getUserProfile().email,
      receiverName: undefined,
      receiverEmail: undefined,
      subject: undefined,
      content: undefined,
    }
    
    this.handleChange=this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleChange(e) {
    switch (e.target.name) {
    case 'receiver-name':
      this.setState({
        receiverName: e.target.value
      });
      break;
    case 'receiver-email':
      this.setState({
        receiverEmail: e.target.value
      });
      break;
    case 'subject':
      this.setState({
        subject: e.target.value
      });
      break;
    case 'content':
      this.setState({
        content: e.target.value
      });
      break;
    default:
      return false;
    }

  }
  handleSubmit(e) {
    e.preventDefault();
    console.log(this.state);
    var to='To: "' + this.state.receiverName + '" <' + this.state.receiverEmail + '>';
    var from = 'From: "' + this.state.senderName + '" <' +this.state.senderEmail + '>';
    var subject = 'Subject: ' + this.state.subject;
    var contentType='Content-Type: text/plain; charset=utf-8';
    var mime='MIME-Version: 1.0';

    var message="";
    message += to + "\r\n";
    message += from + "\r\n";
    message += subject + "\r\n";
    message += contentType + "\r\n";
    message += mime + "\r\n";
    message += "\r\n" + this.state.content;

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
      .then((ressource) => {
        console.log(ressource);
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
                </div>
                <div className="Sender-email">
                  <input type="text" name="receiver-email" className="Receiver-email-input Message-input" placeholder="E-mail" onChange={this.handleChange}/>
                </div>
              </div>
            </div>
            <div className="MessageContainer-header-bottom">
              <div className="Subject">
                <input type="text" name="subject" className="Subject-input Message-input" placeholder="Subject" onChange={this.handleChange}/>
              </div>
            </div>
            <div className="MessageContainer-content">
              <textarea name="content" className="Content-input Message-input" placeholder="Your content" onChange={this.handleChange} />
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

    this.state={
      message: {},
      messageLoaded: false
    }
  }
  componentDidMount() {
    this.getMessage(this.props.params.messageId)
      .then((messageObject) => {
        return this.formatMessageObject(messageObject);
      })
      .then((formattedMessage) => {
        this.setState({
          message: formattedMessage,
          messageLoaded: true
        });
        console.log(formattedMessage);
        if (formattedMessage.unread) {
          this.removeUnread(formattedMessage.id);
        }
      });
    window.iframely && iframely.load();
  }
  getIframelyHtml() {
    return {
      __html: this.getMessageContent()
    };
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
  getMessage(messageId) {
    return gapi.client.gmail.users.messages.get({
        'userId': 'me',
        'id': messageId,
      })
      .then(ressource => {
        return ressource.result;
      });
  }
  formatMessageObject(messageObject) {
    const formattedMessage=messageObject;
    formattedMessage.headers = messageObject.payload.headers.reduce(function (messageHeaders, header) {
      messageHeaders[header.name.toLowerCase()] = header.value;
      return messageHeaders;
    }, {});
    if (messageObject.labelIds.indexOf('UNREAD')> -1) {
      formattedMessage.unread = true;
    }
    return formattedMessage;
  }
  getSender() {
    let value=this.state.message.headers.from.split(' <');
    let sender = {};
    sender.name=value[0];
    sender.email = '<' + value[1];
    return sender;
  }
  getMessageContent() {
    let htmlContent;
    if (this.state.message.payload.body.size === 0) {
      console.log(this.state.message.payload.parts);
      if (this.state.message.payload.parts[1].body !== undefined) {
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
    return decodeURIComponent(Array.prototype.map.call(atob(str), function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  }
  render() {
    if (!this.state.messageLoaded) {
      return null;
    }
    return (
      <main className="Message">
        <div className="MessageContainer">
          <div className="MessageContainer-header">
            <div className="MessageContainer-header-top">
              <div className="Sender">
                <div className="Sender-name"> {this.getSender().name} </div>
                <div className="Sender-email"> {this.getSender().email} </div>
              </div>
              <div className="ReplyTo">
                <button type="button" name="button" className="ReplyTo-button Button"> Reply to </button>
              </div>
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
  constructor() {
    super();
    this.handleDisplay = this.handleDisplay.bind(this);
  }
  formatDate(dateString) {
    const date = new Date(dateString);
    return moment(date.getTime()).format('D MMM');
  }
  handleDisplay() {
    this.props.handleDisplay(this.props.message)
  }
  render() {
    let that = this;
    var MessageLineClasses = classNames(
      'MessageLine', {
        'unread': that.props.message.unread,
      }
    );
    return (
      <div className={MessageLineClasses} onClick={this.handleDisplay}>
        <div className="MessageLine-select">
          <input type="checkbox" className="MessageLine-select-input" />
        </div>
        <div className="MessageLine-content">
          <span className="MessageLine-sender">{this.props.message.headers.from.name}</span>
          <span className="MessageLine-subject">
            <p>{this.props.message.headers.subject}</p>
          </span>
          <span className="MessageLine-date">{this.formatDate(this.props.message.headers.date)}</span>
        </div>
      </div>
    );
  }
}

class MessagesList extends Component {
  constructor() {
    super();
    this.state={
      messages: [],
    }
    this.handleDisplay = this.handleDisplay.bind(this);
  }
  //+
  componentDidMount() {
    this.setStateMessages(this.props.params.listType);
  }
  componentWillReceiveProps(nextProps) {
    this.setStateMessages(nextProps.params.listType);
  }
  setStateMessages(listType) {
    this.getMessagesList(listType).then((messages) => {
      console.log(messages);
      this.setState({
        messages: messages
      });
      console.log(this.state);
    });
  }
  handleDisplay(message) {
    this.props.storeMessageDisplay(message);
    browserHistory.push('/message/' + message.id);
  }

  displayMessagesList() {
    var that = this;
    var messageLines = this.state.messages.map(function (message, index) {
      return <MessageLine message={message} key={message.id} handleDisplay={that.handleDisplay}/>
    });
    return messageLines;
  }
  getMessagesIds(label, nb) {
    return gapi.client.gmail.users.messages.list({
      'userId': 'me',
      'maxResults': nb,
      'labelIds': label
    }).then((ressource) => {
      return ressource.result.messages;
    });
  }
  getMessages(messagesIds) {
    return Promise.all(
      messagesIds.map(function (message) {
        return gapi.client.gmail.users.messages.get({
          'userId': 'me',
          'id': message.id,
          'format': 'metadata'
        }).then(function (ressource) {
          return ressource.result;
        })
      })
    );
  }
  getMessagesList(listType) {
    return this.getMessagesIds(listType.toUpperCase(), 20)
      .then((messagesIds) => {
        return this.getMessages(messagesIds);
      })
      .then((messagesObjects) => {
        return MessagesHelper.format(messagesObjects);
      });
  }
  render() {
    return (<main className="MessagesList">{this.displayMessagesList()}</main>);
  }
}

class MailCategories extends Component {
  getLabelsList() {
     gapi.client.gmail.users.labels.list({
        'userId': 'me'
      })
      .then(ressource => {
        console.log(ressource.result.labels);
      });
  }
  render() {
    this.getLabelsList();
    return (
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
    if (this.props.type === 'list') {
      headingToolbarMain =
        <div className="HeadingToolbar-column AppColumn main row">
          <div className="HeadingToolbar-selectAll">
            <input type="checkbox" name="SelectAll" />
          </div>
          <div className="HeadingToolbar-paging Paging">
            <span className="Paging-actualMessages">1 - 20</span>
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
          <div className="HeadingToolbar-text">
            <h2>{this.props.text}</h2>
          </div>
          <div className="HeadingToolbar-paging Paging">
            <span className="Paging-actualMessages">1 - 50</span>
            <span className="Paging-of">&nbsp;of&nbsp;</span>
            <span className="Paging-totalMessages">90</span>
            <nav className="Paging-PagingNav Paging-nav">
              <a href="#" className="PagingNav-prev">&lt;</a>
              <a href="#" className="PagingNav-next">&gt;</a>
            </nav>
          </div>
        </div>;
    }

    return (
      <section className="HeadingToolbar Wrapper">
        <div className="AppColumn left">
          <Link to="/compose" className="HeadingToolbar-composeEmail Button action">Compose</Link>
        </div>
        {headingToolbarMain}
      </section>
    );
  }
}

class Account extends Component {
  constructor() {
    super();
    this.state={
      userProfile: {}
    }
  }
  componentDidMount() {
    this.setState({
      userProfile: UserApi.getUserProfile()
    });
  }
  signOut() {
    return UserApi.signUserOut();
  }
  render() {
    const userProfile = this.state.userProfile;
    return (
      <div className="Account">
        <img src={userProfile.image} alt="Account" className="Account-image" />
        <div className="Account-perso Perso">
          <div className="Perso-name">{userProfile.name}</div>
          <div className="Perso-email">{userProfile.email}</div>
          <a className="Perso-signout" href="#" onClick={this.signOut}> Sign out</a>
        </div>
      </div>
    );
  }
}

class Headbar extends Component {
  render() {
    var isLoggedInContent = ' ';
    if (this.props.isLoggedIn) {
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
              <img src={logo} alt="Logo" />
            </div>
            <h1 className="Logo-text">FMail</h1>
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
    this.state={
      googleAPILoading: true,
      actualMessage: '',
    }

    this.storeMessageDisplay = this.storeMessageDisplay.bind(this);

  }
  componentDidMount() {
    return UserApi.init()
    .then(() => {
      UserApi.listenForUserSignChange(updateSigninStatus);
    })
    .then(() => {
      return this.setState(() => {
        return { googleAPILoading: false };
      });  
    });
  }
  storeMessageDisplay(message) {
    this.setState({actualMessage : message});
  }
  render() {
    
    if (this.state.googleAPILoading) {
      return null;
    }
    var isLoggedIn = false;
    if (this.props.location.pathname !== '/') {
      isLoggedIn = true;
    }

    var headingToolbarType, headingToolbarText;
    if (this.props.params.listType !== undefined) {
      headingToolbarType='list';
    } else {
      if(this.props.location.pathname !== '/') {
        headingToolbarText = this.state.actualMessage.headers.subject;
      }
    }

    var isLoggedInToolbar = null,
      isLoggedInLeftColumn = null;
    if (isLoggedIn) {
      isLoggedInToolbar =
        <HeadingToolbar type={headingToolbarType} text={headingToolbarText} />;
      isLoggedInLeftColumn =
        <div className="AppColumn left">
          <MailCategories />
        </div>;
    }



    return (
      <div className="AppContainer">
        <Headbar isLoggedIn={isLoggedIn} />
          {isLoggedInToolbar}
          <section className="MainSection Wrapper no-right">
            {isLoggedInLeftColumn}
            <div className="AppColumn main">

              {this.props.children
                && React.cloneElement(this.props.children,
                    {storeMessageDisplay: this.storeMessageDisplay})
              }

            </div>
          </section>
        </div>
    );
  }
}


const Routes = (props) => (
  <Router {...props}>
    <Route component={MailApp}>
      <Route path="/" component={GoogleSign}/>
      <Route path="/list/:listType"  component={MessagesList} />
      <Route path="/message/:messageId" component={Message} />
      <Route path="/compose" component={MessageCompose} />
    </Route>
  </Router>
);

export default Routes;
