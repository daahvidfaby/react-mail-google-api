import React, { Component } from 'react';
import { browserHistory } from 'react-router';
const gapi = window.gapi;

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

  export default MessageCompose;