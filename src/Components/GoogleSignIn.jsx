import React, { Component } from 'react';

class GoogleSignIn extends Component {
    render() {
        return (
        <div className="GoogleSignIn">
            <button className="GoogleSignIn-button Button" onClick={() => window.gapi.auth2.getAuthInstance().signIn()}>Sign-in with google</button>
        </div>
        );
    }
}

export default GoogleSignIn;