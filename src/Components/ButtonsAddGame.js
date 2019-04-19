import React, { Component } from "react";
import {
  getCurrentUser,
  getProfilePicUrl,
  getServerTimestamp
} from "../Scripts/firebase";
import { pushGamesToUser, pushGames } from "../Scripts/firebase";

export default class ButtonsAddGame extends Component {
  onSubmit = e => {
    // Get the game
    //const { name, thing_id } = this.state;
    const thing_id = this.props.thing_id;
    const name = this.props.name;
    if (!name || !thing_id) {
      alert("Select a game");
      e.preventDefault();
      return;
    }
    // Data to store in Firebase
    e.preventDefault();
    var owner = getCurrentUser().displayName;
    var profilePicUrl = getProfilePicUrl();
    const timestamp = getServerTimestamp();
    /*// Create a Game document reference with thing_id as ID
    let fire_game = getGameReference(leadingZeros(thing_id));
    const data_game = {
      owner: owner,
      profilePicUrl: profilePicUrl,
      status: "owned",
      name: name,
      thing_id: thing_id,
      timestamp: timestamp
    };
    setGameReference(fire_game, data_game, onSuccessfullySetDocument);
    */
    const onSuccessfullySetDocument = () => {
      console.log("Saved new Game document");
      // Get document with all comments, push new comment
      var data_user = {
        profilePicUrl: getProfilePicUrl(),
        lastEdit: timestamp,
        timestamp: timestamp
      };
      pushGamesToUser(
        ["owned"],
        [thing_id],
        [name],
        data_user,
        console.log("Saved new boardgame in User document")
      );
    };
    const data_games = {
      lastEditorPicUrl: profilePicUrl,
      lastEditor: owner,
      lastEdit: timestamp
    };
    pushGames(
      "owned",
      [thing_id],
      [name],
      data_games,
      onSuccessfullySetDocument
    );
  };

  render() {
    return (
      <div>
        <form onSubmit={this.onSubmit}>
          <div className="form-group" />
          <div>
            <button type="submit" className="btn btn-bgn">
              Add to collection
            </button>
          </div>
        </form>
      </div>
    );
  }
}
