import React, { Component } from "react";
import Tile from "../Components/Tile";
import SearchBoardGame from "../Components/SearchBoardGame";
import SearchCollection from "../Components/SearchCollection";
import ButtonsAddGame from "../Components/ButtonsAddGame";
//import Deck from '../Components/Deck'
import { /*getCurrentUser, getUserName,*/ getUser } from "../Scripts/firebase";
import "../Components/SearchBoardGame.css";

class Profile extends Component {
  state = {
    username: undefined,
    name: undefined,
    thing_id: undefined,
    user_data: []
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.user !== prevProps.user) {
      let username = this.props.user.displayName;
      getUser(username, doc => {
        const user_data = doc.data();
        this.setState({ ...this.state, username, user_data });
      });
    }
  }

  // Called by SearchBoardGame when a boardgame suggestion is selected
  setSelectedGame(selectedSuggestion) {
    console.log("Main selectedSuggestion:", selectedSuggestion);
    this.setState({
      ...this.state,
      name: selectedSuggestion.name,
      thing_id: selectedSuggestion.id
    });
  }

  render() {
    let { thing_id, name, username, user_data } = this.state;
    return (
      <div className="panel-body">
        <br />
        <h1>Welcome {username}!</h1>
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

        <h2>Search a collection</h2>
        <br />
        <div className="searchCollection">
          <SearchCollection
          /*passSelection={selectedSuggestion =>
              this.setSelectedGame(selectedSuggestion)
            }*/
          />
          {/*thing_id && (
            <div>
              <Tile thing_id={thing_id} />
              <ButtonsAddGame thing_id={thing_id} name={name} />
            </div>
          )*/}
        </div>
        <br />

        <div className="suggestedBoardGame">
          {thing_id && (
            <div>
              <Tile thing_id={thing_id} />
              <ButtonsAddGame thing_id={thing_id} name={name} />
            </div>
          )}
        </div>
        <br />

        <h2>Your games</h2>
        {user_data.thing_ids &&
          user_data.thing_ids.map(gameid => (
            <Tile key={gameid} thing_id={gameid} />
          ))}
      </div>
    );
  }
}

export default Profile;
