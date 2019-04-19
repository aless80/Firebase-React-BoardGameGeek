import React, { Component } from "react";
import { BrowserRouter, Route, Redirect, Switch } from "react-router-dom";
import Login from "./Pages/Login";
import Navbar from "./Components/Navbar";
import Main from "./Pages/Main";
import Profile from "./Pages/Profile";
import * as firebase from "firebase/app";
import "firebase/auth";

// Secure routes
function AuthenticatedRoute({
  component: Component,
  authenticated,
  redirect = "/login",
  ...rest
}) {
  return (
    <Route
      {...rest}
      render={props =>
        authenticated === true ? (
          <Component {...props} {...rest} />
        ) : (
          <Redirect to={redirect} />
        )
      }
    />
  );
}

export default class App extends Component {
  state = {
    user: null
  };

  setUser = user => {
    this.setState({ user: user });
  };

  // Listen to auth state changes
  initFirebaseAuth() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        console.log("User is logged in");
      } else {
        console.log("User is logged out");
      }
      this.setUser(user);
    });
  }

  componentDidMount() {
    this.initFirebaseAuth();
  }

  render() {
    return (
      <BrowserRouter>
        <div>
          <Navbar setuserCallback={this.setUser} />
          <main className="mdl-layout__content mdl-color--grey-100">
            <Switch>
              <Route exact path="/" component={Main} />
              {/* 
              <Route
                path="/"
                render={props => <Main {...props} user={this.state.user} />}
              />
              */}
              <AuthenticatedRoute
                exact
                path="/profile2"
                authenticated={this.state.user == null}
                redirect="/"
                component={Profile}
              />
              <Route
                exact
                path="/profile"
                render={props => <Profile {...props} user={this.state.user} />}
              />
              <AuthenticatedRoute
                exact
                path="/login"
                authenticated={this.state.user == null}
                redirect="/"
                component={Login}
              />
              <Route exact path="*" render={() => <h1>Page not found</h1>} />
            </Switch>
          </main>
        </div>
      </BrowserRouter>
    );
  }
}
