import React, { Component } from "react";
import Tile from "../Components/Tile";
/*import Card from "../Components/Card";
import SearchBoardGame from "../Components/SearchBoardGame";
import ButtonAddGames from "../Components/ButtonAddGames";
*/
import { getGames } from "../Scripts/firebase";
import {
  getSessionStorage,
  setSessionStorage,
  getOwnersForGame
} from "../Scripts/Utilities";

class Main extends Component {
  state = {
    game_names: undefined,
    thing_ids: undefined,
    localGames: getSessionStorage()
  };

  componentDidMount() {
    // Get games in session storage to state
    if (!this.state.localGames) {
      getGames(doc => {
        this.setState({ ...this.state, localGames: doc.data() });
        setSessionStorage(doc.data());
      });
    }
  }

  /*componentDidUpdate(prevProps, prevState, snapshot) {
    // Check when SessionStorage in state changes
    if (this.state.localGames.thing_ids !== prevState.localGames.thing_ids) {
      console.log('if')
    }
  }*/

  setGameInfo(thing_ids, game_names) {
    this.setState({
      ...this.state,
      thing_ids,
      game_names,
      localGames: getSessionStorage()
    });
  }

  render() {
    //let { thing_ids, game_names } = this.state;
    const numItemsPerRow = 3;
    const spaceBetweenItems = 20;
    const containerStyle = {
      display: "flex",
      flexWrap: "wrap",
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
        <h2>The group's games</h2>
        <div style={containerStyle}>
          {this.state.localGames ? (
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
          )}
        </div>
        <br />

        {/*
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
        <br />

        <div className="searchedBoardGame">
          {thing_ids && thing_ids.length > 0 && (
            <div>
              <Card
                thing_id={thing_ids[0]}
                addGame={false}
                removeGame={false}
              />
              <br />
              <ButtonAddGames
                thing_id={thing_ids[0]}
                name={game_names[0]}
                onSubmit={(game_ids, game_names) => {
                  this.setGameInfo([], []);
                }}
              />
            </div>
          )}
        </div>
        */}
      </div>
    );
  }
}

export default Main;
