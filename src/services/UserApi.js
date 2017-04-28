const gapi = window.gapi;

const UserApi = (function() {

    const self = {
        userProfile: {
            email: undefined,
            image: undefined,
            name: undefined,
        },
    },
    CLIENT_ID = '345060820385-g40i755r2pslhiekg5amgrnitiigp6r6.apps.googleusercontent.com',
    DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"],
    SCOPES = 'https://mail.google.com/';


    self.init = function() {
       return loadAuth2()
       .then(() => {
           return initGapiClient();                         
       });
    }


    self.getSignInPopUp = function() {
        const options = new gapi.auth2.SigninOptionsBuilder();
        options.setPrompt('select_account');
        gapi.auth2.getAuthInstance().signIn(options)
        .then(() => {
            self.init();
        });
    }


    self.signUserOut = function() {
        gapi.auth2.getAuthInstance().signOut();
    }


    self.getUserProfile = function() {
        if(self.userProfile.email === undefined) {
            const profileInstance = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
            self.userProfile.image = profileInstance.getImageUrl();
            self.userProfile.name = profileInstance.getName();
            self.userProfile.email = profileInstance.getEmail();
        }
        return self.userProfile;
    }


    self.listenForUserSignChange = (callback) => {
        gapi.auth2.getAuthInstance().isSignedIn.listen(callback);
    }


    self.getSignInStatus = () => {
        return gapi.auth2.getAuthInstance().isSignedIn.get();
    }


    function loadAuth2() {
         return new Promise((resolve, reject) => {
            gapi.load('client:auth2', () => {
                resolve();
            });
        });
    }


    function initGapiClient() {
        return gapi.client.init({
            discoveryDocs: DISCOVERY_DOCS,
            clientId: CLIENT_ID,
            scope: SCOPES
        });
    }


    return self;

}());

export default UserApi;