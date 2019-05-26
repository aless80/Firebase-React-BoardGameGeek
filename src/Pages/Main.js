import React, { Component } from "react";
import Tile from "../Components/Tile";
import SearchBoardGame from "../Components/SearchBoardGame";
import ButtonAddGames from "../Components/ButtonAddGames";
import { getGames } from "../Scripts/firebase";
import {
  getSessionStorage,
  setSessionStorage,
  getOwnersForGame
} from "../Scripts/Utilities";

class Main extends Component {
  state = {
    name: undefined,
    thing_id: undefined,
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

  setSelectedGame(selectedSuggestion) {
    console.log("Main selectedSuggestion:", selectedSuggestion);
    this.setState({
      ...this.state,
      name: selectedSuggestion.name,
      thing_id: selectedSuggestion.id
    });
  }

  render() {
    let { thing_id, name } = this.state;
    const numItemsPerRow = 3;
    const spaceBetweenItems = 20;
    const containerStyle = {
      display: "flex",
      flexWrap: "wrap",
      margin: `-${spaceBetweenItems * 0.5}px`
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
        <br />
        <h2>The group's games</h2>
        <div style={containerStyle}>
          {this.state.localGames &&
            this.state.localGames.thing_ids.map(gameid => (
              <div style={itemStyle}>
                <Tile
                  key={gameid}
                  thing_id={gameid}
                  owners={getOwnersForGame(gameid, this.state.localGames)}
                />
              </div>
            ))}
        </div>
        <br />
        <h2>Search a game</h2>
        <br />
        <div className="searchBoardGame">
          <SearchBoardGame
            exact={1}
            boardgame={1}
            boardgameaccessory={0}
            boardgameexpansion={0}
            passSelection={selectedSuggestion =>
              this.setSelectedGame(selectedSuggestion)
            }
          />
        </div>
        <br />

        <div className="suggestedBoardGame">
          {thing_id && (
            <div>
              <Tile thing_id={thing_id} />
              <br />
              <ButtonAddGames thing_id={thing_id} name={name} />
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Main;
