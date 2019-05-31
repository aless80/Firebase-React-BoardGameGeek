import React, { Component } from "react";
import {
  getCurrentUser,
  getProfilePicUrl,
  getServerTimestamp
} from "../Scripts/firebase";
import {
  pushGamesToUsersCollection,
  pushGamesToGamesCollection
} from "../Scripts/firebase";
import {
  getSessionStorage,
  setSessionStorage,
  addGameToUserData,
  addGameToGamesData
} from "../Scripts/Utilities";

export default class ButtonAddGames extends Component {
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
    // Game data to push to Firebase, Games collection
    const data_games = {
      lastEditorPicUrl: profilePicUrl,
      lastEditor: owner,
      lastEdit: timestamp
    };
    // Callback triggered after saving to Firebase, Games collection
    const onSuccessfullySetDocument = () => {
      console.log("Saved new document to Game collection");
      // Get document with all comments, push new comment
      var data_user = {
        profilePicUrl: getProfilePicUrl(),
        lastEdit: timestamp,
        timestamp: timestamp
      };
      // Save in Firebase, Users collection
      pushGamesToUsersCollection(
        [thing_id],
        [name],
        ["owned"],
        data_user,
        () => {
          console.log("Saved new document in Users collection");
          let updated;
          let localUser = getSessionStorage("localUser");
          [localUser, updated] = addGameToUserData(
            localUser,
            [thing_id],
            [name],
            ["owned"]
          );
          setSessionStorage(localUser, "localUser");
          // Save games to SessionStorage, to save calls to Firebase
          let localGames = getSessionStorage("localGames");
          [localGames, updated] = addGameToGamesData(
            localGames,
            [thing_id],
            [name],
            [owner]
          );
          setSessionStorage(localGames, "localGames");
          //Send thing_ids added to parent
          this.props.onSubmit([thing_id], [name]);
        }
      );
    };
    pushGamesToGamesCollection(
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
