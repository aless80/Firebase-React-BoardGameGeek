import React, { Component } from "react";
import Tile from "../Components/Tile";
import SearchBoardGame from "../Components/SearchBoardGame";
import ButtonsAddGame from "../Components/ButtonsAddGame";
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
    return (
      <div>
        <div className="panel-body">
          <br />
          <h2>The group's games</h2>
          {this.state.localGames &&
            this.state.localGames.thing_ids.map(gameid => (
              <Tile
                key={gameid}
                thing_id={gameid}
                owners={getOwnersForGame(gameid, this.state.localGames)}
              />
            ))}

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
                <ButtonsAddGame thing_id={thing_id} name={name} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Main;
