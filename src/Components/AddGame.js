import React, { Component } from "react";
import {
  getCurrentUser,
  getProfilePicUrl,
  getServerTimestamp,
  pushGamesToUsersCollection,
  pushGamesToGamesCollection
} from "../Scripts/firebase";
import {
  getSessionStorage,
  setSessionStorage,
  addGameToUserData,
  addGameToGamesData
} from "../Scripts/Utilities";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";

export default class AddGame extends Component {
  onSubmit = e => {
    // Get the game
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
        owner,
        [thing_id],
        [name],
        ["owned"],
        data_user,
        () => {
          console.log("Saved new document in Users collection");
          let localUser = getSessionStorage("localUser");
          [localUser] = addGameToUserData(
            localUser,
            [thing_id],
            [name],
            ["owned"]
          );
          setSessionStorage(localUser, "localUser");
          // Save games to SessionStorage, to save calls to Firebase
          let localGames = getSessionStorage("localGames");
          [localGames] = addGameToGamesData(
            localGames,
            [thing_id],
            [name],
            [owner]
          );
          setSessionStorage(localGames, "localGames");
          //Send thing_ids added to parent
          this.props.onAddedGames([thing_id], [name]);
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
        <Fab
          variant="extended"
          size="small"
          color="primary"
          aria-label="Add"
          className="fab_icon"
          onClick={(event) => {
            this.onSubmit(event)
          }}
        >
          <AddIcon className="" />
          Add
        </Fab>
        {/*
        <form onSubmit={this.onSubmit}>
          <div className="form-group" />
          <div>
            <button type="submit" className="btn btn-bgn">
              Add to collection
            </button>
          </div>
        </form>
        <br />
      </div>
      */}
      </div>
    );
  }
}
