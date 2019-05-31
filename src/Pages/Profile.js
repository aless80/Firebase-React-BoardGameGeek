import React, { Component } from "react";
import Card from "../Components/Card";
import SearchBoardGame from "../Components/SearchBoardGame";
import SearchCollection from "../Components/SearchCollection";
import ButtonAddGames from "../Components/ButtonAddGames";
import { getUser, getGames } from "../Scripts/firebase";
import {
  getSessionStorage,
  setSessionStorage,
  getOwnersForGame
} from "../Scripts/Utilities";
import { Container, Row, Col } from "reactstrap";
import {
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Button,
  CardTitle,
  CardText
} from "reactstrap";
import "../Components/SearchBoardGame.css";

class Profile extends Component {
  state = {
    username: undefined,
    game_names: undefined,
    thing_ids: [],
    localUser: getSessionStorage("localUser"),
    localGames: getSessionStorage("localGames"),
    activeTab: "yourGames"
  };

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({ ...this.state, activeTab: tab });
    }
  }
  componentDidMount() {
    // Get games in session storage to state
    if (!this.state.localGames) {
      getGames(doc => {
        this.setState({ ...this.state, localGames: doc.data() });
        setSessionStorage(doc.data(), "localGames");
      });
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.user !== prevProps.user) {
      let username = this.props.user.displayName;
      getUser(username, doc => {
        const localUser = doc.data();
        this.setState({ ...this.state, username, localUser });
        setSessionStorage(localUser, "localUser");
      });
    }
  }

  // Called by SearchBoardGame when a boardgame suggestion is selected
  setGameInfo(thing_ids, game_names = []) {
    console.log("thing_ids, game_names:", thing_ids, game_names);
    this.setState({
      ...this.state,
      thing_ids,
      game_names,
      localGames: getSessionStorage("localGames"),
      localUser: getSessionStorage("localUser")
    });
  }

  render() {
    let { thing_ids, game_names, username, localUser } = this.state;
    return (
      <div className="panel-body">
        <br />
        {username && <h1>Welcome {username}!</h1>}
        <br />

        <Nav tabs>
          <NavItem>
            <NavLink
              //className={classnames({ active: this.state.activeTab === "1" })}
              onClick={() => {
                this.toggle("yourGames");
              }}
            >
              Your games
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              //className={classnames({ active: this.state.activeTab === "2" })}
              onClick={() => {
                this.toggle("searchBoardGame");
              }}
            >
              Search a game
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              //className={classnames({ active: this.state.activeTab === "2" })}
              onClick={() => {
                this.toggle("searchCollection");
              }}
            >
              Search a collection
            </NavLink>
          </NavItem>
        </Nav>

        <TabContent activeTab={this.state.activeTab}>
          <TabPane tabId="yourGames">
            <Row>
              <Col>
                <h2>Your games</h2>
                {localUser.thing_ids && !localUser.thing_ids.length && (
                  <p>No games found for you in this app's storage</p>
                )}
                {localUser.thing_ids &&
                  localUser.thing_ids.map(game_id => (
                    <Card
                      key={game_id}
                      thing_id={game_id}
                      owners={getOwnersForGame(game_id, this.state.localGames)}
                    />
                  ))}
              </Col>
            </Row>
          </TabPane>
          <TabPane tabId="searchBoardGame">
            <Row>
              <Col>
                <h2>Search a game</h2>
                <br />
                <div className="searchBoardGame">
                  <SearchBoardGame
                    exact={0}
                    boardgame={1}
                    boardgameaccessory={0}
                    boardgameexpansion={0}
                    passGameInfo={(game_id, game_name) => {
                      this.setGameInfo([game_id], [game_name]);
                    }}
                  />
                </div>
              </Col>
            </Row>
          </TabPane>

          <TabPane tabId="searchCollection">
            <Row>
              <Col>
                <h2>Search a collection</h2>
                <br />
                <div className="searchCollection">
                  <SearchCollection
                    passSelection={(thing_ids, names) => {
                      console.log(
                        "passSelection thing_ids, names:",
                        thing_ids,
                        names
                      );
                      this.setGameInfo(thing_ids, names);
                    }}
                  />
                </div>
              </Col>
            </Row>
          </TabPane>
        </TabContent>

        <div className="suggestedBoardGame">
          {thing_ids &&
            thing_ids.length > 0 &&
            thing_ids.map((thing_id, ind) => (
              <div key={thing_id}>
                <Card thing_id={thing_id} />
                <ButtonAddGames
                  thing_id={thing_id}
                  name={game_names[ind]}
                  onSubmit={(game_ids, game_names) => {
                    this.setGameInfo([], []);
                  }}
                />
              </div>
            ))}
        </div>
      </div>
    );
  }
}

export default Profile;
