import React, { Component } from 'react';
const gapi = window.gapi;

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

  export default Account;