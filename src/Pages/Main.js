import React, { Component } from "react";
import Tile from "../Components/Tile";
import SearchBoardGame from "../Components/Search";
//import Autocomplete from "../Components/Autocomplete";

class Main extends Component {
  state = { thing_id: undefined };
  setSelectedGame(selectedSuggestion) {
    console.log("Main selectedSuggestion:", selectedSuggestion);
    this.setState({
      name: selectedSuggestion.name,
      thing_id: selectedSuggestion.id
    });
  }
  render() {
    let { thing_id } = this.state;
    return (
      <div>
        <br />
        <SearchBoardGame
          exact={1}
          boardgame={1}
          boardgameaccessory={0}
          boardgameexpansion={0}
          passSelection={selectedSuggestion =>
            this.setSelectedGame(selectedSuggestion)
          }
        />
        <br />
        {thing_id && <Tile thing_id={thing_id} />}
      </div>
    );
  }
}

export default Main;
