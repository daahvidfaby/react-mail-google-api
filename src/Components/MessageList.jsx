import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';
import MessageLine from './MessageLine';
const gapi = window.gapi;

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
        this.setState({messages: messages});
      });
    }

    displayMessage(id) {
      return () => {
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

  export default MessagesList;