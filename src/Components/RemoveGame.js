import React, { Component } from "react";
import {
  getCurrentUser,
  getProfilePicUrl,
  getServerTimestamp,
  removeGamesFromUsersCollection,
  removeGamesFromGamesCollection
} from "../Scripts/firebase";
import {
  getSessionStorage,
  setSessionStorage,
  removeGamesFromUserData,
  removeGamesFromGamesData
} from "../Scripts/Utilities";
import Fab from "@material-ui/core/Fab";
import DeleteIcon from "@material-ui/icons/Delete";

export default class RemoveGame extends Component {
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
    // Callback triggered after updating data in Firebase, Games collection
    const onSuccessfullySetDocument = () => {
      console.log("Removed document from Game collection");
      // Get document with all comments, push new comment
      var data_user = {
        profilePicUrl: getProfilePicUrl(),
        lastEdit: timestamp,
        timestamp: timestamp
      };
      // Save in Firebase, Users collection
      removeGamesFromUsersCollection(
        owner,
        "owned",
        [thing_id],
        data_user,
        () => {
          console.log("Removed document from Users collection");
          let localUser = getSessionStorage("localUser");
          [localUser] = removeGamesFromUserData(
            localUser,
            [thing_id],
            [name],
            ["owned"]
          );
          setSessionStorage(localUser, "localUser");
          // Save games to SessionStorage, to save calls to Firebase
          let localGames = getSessionStorage("localGames");
          [localGames] = removeGamesFromGamesData(
            localGames,
            [thing_id],
            [owner]
          );
          setSessionStorage(localGames, "localGames");
          //Send thing_ids added to parent
          this.props.onRemovedGames([thing_id], [name]);
        }
      );
    };
    removeGamesFromGamesCollection(
      "owned",
      [thing_id],
      [owner],
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
          color="secondary"
          aria-label="Delete"
          className="fab_icon"
          onClick={event => {
            this.onSubmit(event);
          }}
        >
          <DeleteIcon className="" />
          Remove
        </Fab>
      </div>
    );
  }
}
