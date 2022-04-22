import React, { Component } from 'react';
import Account from './Account';
import logo from '../logo.svg';

class Headbar extends Component {
    render() {
      var isLoggedInContent = ' ';
      if(this.props.isLoggedIn) {
        isLoggedInContent =
          <div className="AppColumn main row">
            <div className="Headbar-searchbar">
             {/*  <input type="text" className="Searchbar" /> */} 
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
                ReactMail
              </h1>
            </div>
          </div>
          {isLoggedInContent}
        </header>
  
      );
    }
  }


  export default Headbar;