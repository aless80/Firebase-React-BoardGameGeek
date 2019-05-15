import React, { Component } from "react";
import Tile from "../Components/Tile";
import SearchBoardGame from "../Components/SearchBoardGame";
import ButtonsAddGame from "../Components/ButtonsAddGame";
import {
  /*getCurrentUser
  getUser 
  getGameReference,
  setGameReference,
  getUserReference,
  //setUserReference,
  pushGameToUser
  /*fire_users,
  getUser,
  setUserReference,
  getUserReference*/
} from "../Scripts/firebase";

class Main extends Component {
  state = {
    username: undefined,
    name: undefined,
    thing_id: undefined,
    user_data: undefined
  };

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
        <br />
        <h1>Main</h1>
        <div className="panel-body">
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
