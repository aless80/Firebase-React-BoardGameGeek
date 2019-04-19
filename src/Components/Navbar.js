import React, { Component } from "react";
import firebase from "../Firebase";
import MaterialIcon from "material-icons-react";
import {
  Collapse,
  Navbar as Navbarstrap,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";
import {
  signIn,
  signOut,
  getUserName,
  getProfilePicUrl
} from "../Scripts/firebase";
import  { Redirect } from 'react-router-dom'

export default class Navbar extends Component {
  state = {
    isOpen: false
  };

  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  };

  componentDidMount() {
    // Checks that the Firebase SDK has been correctly setup and configured.

    // Checks that Firebase has been imported.
    //checkSetup();

    // initialize Firebase
    initFirebaseAuth();

    /*// Remove the warning about timstamps change.
    var firestore = firebase.firestore();
    var settings = { timestampsInSnapshots: true };
    firestore.settings(settings);
    */
  }

  goToProfile() {
    return <Redirect to="/profile"/>
  }

  render() {
    return (
      <div>
        <Navbarstrap color="navbar navbar-dark" expand="md">
          <NavbarBrand href="/">React Firebase Forum</NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem id="user-container">
                <NavLink hidden id="user-pic" href="#" />
                <NavLink hidden id="user-name" href="#" />
                <NavLink hidden id="sign-out" href="#" onClick={signOut}>
                  Sign-out
                </NavLink>
                <NavLink id="sign-in" href="#" onClick={signIn}>
                  <MaterialIcon
                    id="account_circle"
                    icon="account_circle"
                    size="small"
                  />
                  Sign-in with Google
                </NavLink>
              </NavItem>

              {/*<NavLink id="profile" href="/profile" onClick={this.goToProfile}>
                Profile
              </NavLink>*/}

              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  Navigate
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem href="/">Home</DropdownItem>
                  <DropdownItem href="/profile">Profile</DropdownItem>
                  {/*<DropdownItem divider />
                  <DropdownItem>Reset</DropdownItem>
                  */}
                </DropdownMenu>
              </UncontrolledDropdown>
            </Nav>
          </Collapse>
        </Navbarstrap>
      </div>
    );
  }
}

// Initiate firebase auth.
const initFirebaseAuth = () => {
  // Listen to auth state changes.
  firebase.auth().onAuthStateChanged(authStateObserver);
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
const authStateObserver = user => {
  var userPicElement = document.getElementById("user-pic");
  var userNameElement = document.getElementById("user-name");
  var signInButtonElement = document.getElementById("sign-in");
  var signOutButtonElement = document.getElementById("sign-out");
  if (user) {
    // User is signed in!
    // Get the signed-in user's profile pic and name.
    var profilePicUrl = getProfilePicUrl();
    var userName = getUserName();

    // Set the user's profile pic and name.
    userPicElement.style.backgroundImage =
      "url(" + addSizeToGoogleProfilePic(profilePicUrl) + ")";
    userNameElement.textContent = userName;

    // Show user's profile and sign-out button.
    userNameElement.removeAttribute("hidden");
    userPicElement.removeAttribute("hidden");
    signOutButtonElement.removeAttribute("hidden");

    // Hide sign-in button.
    signInButtonElement.setAttribute("hidden", "true");

    // We save the Firebase Messaging Device token and enable notifications.
    //saveMessagingDeviceToken();
  } else {
    // User is signed out!
    // Hide user's profile and sign-out button.
    userNameElement.setAttribute("hidden", "true");
    userPicElement.setAttribute("hidden", "true");
    signOutButtonElement.setAttribute("hidden", "true");

    // Show sign-in button.
    signInButtonElement.removeAttribute("hidden");
  }
};

/*function checkSignedInWithMessage() {
  ..
}

// Resets the given MaterialTextField.
function resetMaterialTextfield(element) {
  element.value = "";
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
}

// Template for messages.
var MESSAGE_TEMPLATE =
  '<div class="message-container">' +
  '<div class="spacing"><div class="pic"></div></div>' +
  '<div class="message"></div>' +
  '<div class="name"></div>' +
  "</div>";
*/

// Adds a size to Google Profile pics URLs.
const addSizeToGoogleProfilePic = url => {
  if (url.indexOf("googleusercontent.com") !== -1 && url.indexOf("?") === -1) {
    return url + "?sz=150";
  }
  return url;
};

/*
// Checks that the Firebase SDK has been correctly setup and configured.
function checkSetup() {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions and make ' +
        'sure you are running the codelab using `firebase serve`');
  }
}
*/
/*

  // Loads chat messages history and listens for upcoming ones.
function loadMessages() {
  // Create the query to load the last 12 messages and listen for new ones.
  var query = firebase.firestore().collection('messages').orderBy('timestamp', 'desc').limit(12);
  
  // Start listening to the query.
  query.onSnapshot(function(snapshot) {
    snapshot.docChanges().forEach(function(change) {
      if (change.type === 'removed') {
        deleteMessage(change.doc.id);
      } else {
        var message = change.doc.data();
        displayMessage(change.doc.id, message.timestamp, message.name,
                      message.plainText, message.profilePicUrl, message.imageUrl);
      }
    });
  });
}
*/
