import React, { Component } from 'react';
import { Link } from 'react-router';
var classNames = require('classnames');
var moment = require('moment');

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
            <Link to={'/message/'+ this.props.id}>
              <span className="MessageLine-sender">{this.props.headers.from.name}</span>
              <span className="MessageLine-subject">{this.props.headers.subject}</span>
              <span className="MessageLine-date">{this.formatDate(this.props.headers.date)}</span>
            </Link>
          </div>
        </div>
      );
    }
  }


  export default MessageLine;