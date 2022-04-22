import React, { Component } from 'react';
const iframely = window.iframely;
const gapi = window.gapi;

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

  export default Message;