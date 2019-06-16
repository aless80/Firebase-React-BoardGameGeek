import React, { Component } from "react";
import Card from "../Components/Card";
import SearchBoardGame from "../Components/SearchBoardGame";
import SearchCollection from "../Components/SearchCollection";
import ButtonAddGames from "../Components/ButtonAddGames";
import { getUser, getGames } from "../Scripts/firebase";
import {
  getSessionStorage,
  setSessionStorage,
  getOwnersForGame,
  isGameOwned
} from "../Scripts/Utilities";
import { Row, Col } from "reactstrap";
import {
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink
  /*Button,
  CardTitle,
  CardText*/
} from "reactstrap";
import "../Components/SearchBoardGame.css";
import classnames from "classnames";

class Profile extends Component {
  state = {
    username: undefined,
    game_names: [],
    thing_ids: [],
    localUser: getSessionStorage("localUser"),
    localGames: getSessionStorage("localGames"),
    activeTab: "yourGames"
  };

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

  // Change tab
  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        ...this.state,
        game_names: [],
        thing_ids: [],
        activeTab: tab
      });
    }
  }

  // Called by SearchBoardGame when a boardgame suggestion is selected
  setGameInfo(thing_ids, game_names = []) {
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
              className={classnames({
                active: this.state.activeTab === "yourGames"
              })}
              onClick={() => {
                this.toggle("yourGames");
              }}
            >
              Your games
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({
                active: this.state.activeTab === "searchBoardGame"
              })}
              onClick={() => {
                this.toggle("searchBoardGame");
              }}
            >
              Search a game
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({
                active: this.state.activeTab === "searchCollection"
              })}
              onClick={() => {
                this.toggle("searchCollection");
              }}
            >
              Search a collection
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={this.state.activeTab} className="hey">
          <br />
          <TabPane tabId="yourGames">
            <Row>
              <Col>
                {localUser.thing_ids && !localUser.thing_ids.length && (
                  <p>No games found for you in this app's storage</p>
                )}
                {localUser.thing_ids &&
                  localUser.thing_ids.map(game_id => (
                    <Card
                      key={game_id}
                      thing_id={game_id}
                      owners={getOwnersForGame(game_id, this.state.localGames)}
                      addGame={
                        !isGameOwned(
                          this.state.username,
                          game_id,
                          this.state.localGames
                        )
                      }
                      removeGame={isGameOwned(
                        this.state.username,
                        game_id,
                        this.state.localGames
                      )}
                    />
                  ))}
              </Col>
            </Row>
          </TabPane>
          <TabPane tabId="searchBoardGame">
            <Row>
              <Col>
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
                <br />
                <div className="searchCollection">
                  <SearchCollection
                    passSelection={(thing_ids, names) => {
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
            thing_ids.map((game_id, ind) => (
              <div key={game_id}>
                <Card
                  thing_id={game_id}
                  owners={getOwnersForGame(game_id, this.state.localGames)}
                  addGame={
                    !isGameOwned(
                      this.state.username,
                      game_id,
                      this.state.localGames
                    )
                  }
                  removeGame={isGameOwned(
                    this.state.username,
                    game_id,
                    this.state.localGames
                  )}
                />
                <ButtonAddGames
                  thing_id={game_id}
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
