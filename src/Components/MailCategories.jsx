import React, { Component } from 'react';
import { Link } from 'react-router';

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

  export default MailCategories;