import React, { Component } from "react";
import Card from "../Components/Card";
import Tile from "../Components/Tile";
import SearchBoardGame from "../Components/SearchBoardGame";
import SearchCollection from "../Components/SearchCollection";
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

class Main extends Component {
  state = {
    username: undefined,
    game_names: [],
    thing_ids: [],
    localUser: getSessionStorage("localUser"),
    localGames: getSessionStorage("localGames"),
    activeTab: "groupGames"
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

  // Update localStorage when a new game is added
  onAddedGames(game_ids, game_names) {
    let { thing_ids } = this.state;
    if (thing_ids.indexOf(game_ids[0]) >= 0) {
      // Use setGameInfo to call getSessionStorage
      this.setGameInfo(thing_ids, this.state.game_names);
    } else {
      // Add new game to localStorage
      this.setGameInfo(
        [...thing_ids, ...game_ids],
        [...this.state.game_names, ...game_names]
      );
    }
  }

  // Update localStorage when a new game is removed
  onRemovedGames(game_ids, game_names) {
    let { thing_ids } = this.state;
    // Remove game from localStorage
    this.setGameInfo(
      [...thing_ids.filter(thing_id => game_ids.indexOf(thing_id) >= 0)],
      [...this.state.game_names.filter(name => game_names.indexOf(name) >= 0)]
    );
  }

  render() {
    let { thing_ids, localUser } = this.state;
    const numItemsPerRow = 3;
    const spaceBetweenItems = 20;
    const containerStyle = {
      display: "flex",
      flexWrap: "wrap"
      //margin: `-${spaceBetweenItems * 0.5}px`
    };
    const itemStyle = {
      display: "block",
      flex: "none",
      width: `${100 / numItemsPerRow}%`,
      boxSizing: "border-box",
      padding: `${spaceBetweenItems * 0.5}px`
    };
    return (
      <div className="panel-body">
        <Nav tabs>
          <NavItem>
            <NavLink
              className={classnames({
                active: this.state.activeTab === "groupGames"
              })}
              onClick={() => {
                this.toggle("groupGames");
              }}
            >
              The group's games
            </NavLink>
          </NavItem>
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

        {/* Tab: Group's games */}
        <div style={containerStyle}>
          {this.state.activeTab === "groupGames" && (this.state.localGames ? (
            this.state.localGames.thing_ids.map(gameid => (
              <div key={gameid} style={itemStyle}>
                <Tile
                  key={gameid}
                  thing_id={gameid}
                  owners={getOwnersForGame(gameid, this.state.localGames)}
                />
              </div>
            ))
          ) : (
            <p>No games found</p>
          ))}
        </div>

        <TabContent activeTab={this.state.activeTab} className="hey">
          <br />

          {/* Tab: Your games */}
          <TabPane tabId="yourGames">
            <Row>
              <Col>
                {(localUser === "" ||
                  !localUser.thing_ids ||
                  !localUser.thing_ids.length) && <p>No games found</p>}
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
                      onAddedGames={() => {}}
                      onRemovedGames={(game_ids, game_names) =>
                        this.onRemovedGames(game_ids, game_names)
                      }
                    />
                  ))}
              </Col>
            </Row>
          </TabPane>

          {/* Tab: Search a game */}
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

          {/* Tab: Search a collection */}
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

        {/* TODO: can merge with other card above? */}
        <div className="searchedBoardGame">
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
                  onAddedGames={(game_ids, game_names) =>
                    this.onAddedGames(game_ids, game_names)
                  }
                  onRemovedGames={(game_ids, game_names) =>
                    this.onRemovedGames(game_ids, game_names)
                  }
                />
              </div>
            ))}
        </div>
      </div>
    );
  }
}

export default Main;