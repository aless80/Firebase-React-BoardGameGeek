import firebase from "../Firebase";
import {
  addGameToUserData,
  addGameToGamesData,
  removeGamesFromUserData,
  removeGamesFromGamesData
} from "../Scripts/Utilities";
/**
 * Cloud Storage
 *
 * @return {Object}
 */
export const storage = firebase.storage();

/**
 * Return the signed-in user.
 *
 * @return {object}
 */
export const getCurrentUser = () => {
  return firebase.auth().currentUser;
};

/**
 * Return the signed-in user's display name.
 *
 * @return {string}
 */
export const getUserName = () => {
  return firebase.auth().currentUser.displayName;
};

/**
 * Return the signed-in user's profile Pic URL.
 *
 * @return {string}
 */
export const getProfilePicUrl = () => {
  return (
    firebase.auth().currentUser.photoURL || "/images/profile_placeholder.png"
  );
};

/**
 * Return a style for the picture
 *
 * @param {string} url
 * @param {object} [style] - object with additional style formatted for react
 * @return {object}
 */
export const profilePicStyle = (url, style = {}) => {
  if (!url) {
    return undefined;
  }
  if (url.indexOf("googleusercontent.com") !== -1 && url.indexOf("?") === -1) {
    url = url + "?sz=150";
  }
  style["backgroundImage"] = `url(${url})`;
  return style;
};

/**
 * Get the current timestamp from firebase server
 *
 * @return {Timestamp} - firebase timestamp
 */
export const getServerTimestamp = () => {
  return firebase.firestore.FieldValue.serverTimestamp();
};

/**
 * Signs-in in Firebase using popup auth and Google as the identity provider
 */
export const signIn = () => {
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider);
};

/**
 * Signs-out of application.
 */
export const signOut = () => {
  // Sign out of Firebase.
  firebase.auth().signOut();
};

/* CRUD and other operations on Users and Games collections in Firebase Database */

/**
 * Get the User collection
 * @type {firebase.firestore.DocumentReference}
 */
export const fire_users = firebase.firestore().collection("Users");

/**
 * Get the Games collection
 * @type {firebase.firestore.CollectionReference}
 */
export const fire_games = firebase.firestore().collection("Games");

/**
 * Get a user document and optionally run a callback on it
 *
 * @param {string} username - The user id
 * @callback [onGetDocument] - Callback on a document triggering when comment document is successfully retrieved
 */
export const getUser = (username, onGetDocument = () => {}) => {
  fire_users
    .doc(username)
    .get()
    .then(doc => {
      if (doc.exists) {
        onGetDocument(doc);
      } else {
        console.warn("No User document found");
      }
    });
};

/**
 * Helper method to get all Games from Firebase
 *
 * @callback [onAfterGetDocument] - Callback triggering after a successfull get
 */
export const getGames = (onAfterGetDocument = () => {}) => {
  fire_games
    .doc("owned")
    .get()
    .then(doc => {
      var document = doc.data();
      console.log("document:", document);
      onAfterGetDocument(doc);
    })
    .catch(error => {
      console.error("Error on getting all games: ", error);
      return;
    });
};

/**
 * Get a DocumentReference in Users collection. It can be used to populate properties before actually saving the user
 *
 * @return {DocumentReference} - A reference to a document in firebase firestore
 */
export const getUserReference = username => {
  var fire_user;
  if (username) {
    fire_user = fire_users.doc(username);
  } else {
    fire_user = fire_users.doc();
  }
  return fire_user;
};

/**
 * Save a DocumentReference in Users collection
 * This helper method is not used in the app
 *
 * @param {*} fire_user - An existing DocumentReference to a user
 * @param {*} data_user - The user data to be set
 * @callback [onSetDocument] - Callback triggering when User document is successfully set
 */
export const setUserReference = (
  fire_user,
  data_user,
  onSetDocument = () => {}
) => {
  fire_user.set(data_user).then(() => {
    onSetDocument();
  });
};

/**
 * Get a Game document and optionally run a callback on it
 *
 * @param {string} thing_id - The game id from BGG
 * @callback [onGetDocument] - Callback on a document triggering game document is successfully retrieved
 */
export const getGame = (thing_id, onGetDocument = () => {}) => {
  fire_games
    .doc(thing_id)
    .get()
    .then(doc => {
      if (doc.exists) {
        onGetDocument(doc);
      } else {
        console.error("No such Game document");
      }
    })
    .catch(error => {
      console.error("Error on getting game: ", error);
      return;
    });
};

/**
 * Append a game to a User document
 *
 * @param {string} category - Boardgame status e.g. 'owned', 'whishlist'
 * @param {string[]} thing_ids - Array with game IDs from BGG
 * @param {string[]} names - Array with game names from BGG
 * @param {*} data - Data to be set in the Game document. It should contain the game owner in the lastEditor field
 * @callback [onSetDocument] - Callback triggering on a successful update of the Comment document
 *
 */
export const pushGamesToGamesCollection = (
  category,
  thing_ids,
  names,
  data,
  onSetDocument = () => {}
) => {
  var fire_allgames = fire_games.doc(category);
  let edited = 0;
  fire_allgames
    .get()
    .then(doc => {
      var document = doc.data();
      /*if (!document) {
        document = { thing_ids: [], names: [], owners: [] };
      }*/
      const owner = getUserName();
      [document, edited] = addGameToGamesData(
        document,
        thing_ids,
        names,
        Array(thing_ids.length).fill(owner)
      );
      // Save the Game document to Firebase only if it was modified
      if (edited) {
        //Store last edit info
        document = { ...document, ...data };
        fire_allgames
          .set(document)
          .then(onSetDocument())
          .catch(error => {
            console.error("Error on setting User document: ", error);
          });
      } else {
        console.log(
          "The Game document already contained the user's boardgame and did not need to be updated"
        );
      }
    })
    .catch(error => {
      console.error("Error on getting Game document: ", error);
    });
};

/**
 * Append a game to a User document
 *
 * @param {string[]} thing_ids - Array with game IDs from BGG
 * @param {string[]} names - Array with game names from BGG
 * @param {string} categories - Boardgame status e.g. 'owned', 'whishlist'
 * @param {*} data - Data to be set in the Game document. It should contain the game owner in the lastEditor field
 * @callback [onSetDocument] - Callback triggering on a successful update of the Comment document
 *
 */
export const pushGamesToUsersCollection = (
  owner,
  thing_ids,
  names,
  categories,
  data,
  onSetDocument = () => {}
) => {
  const fire_user = getUserReference(owner);
  let edited = 0;
  fire_user
    .get()
    .then(doc => {
      var document = doc.data();
      if (!document) {
        document = { thing_ids: [], names: [], categories: [] };
      }
      [document, edited] = addGameToUserData(
        document,
        thing_ids,
        names,
        categories
      );
      // Save the Game document to Firebase only if it was modified
      if (edited) {
        //Store last edit info
        document = { ...document, ...data };
        fire_user
          .set(document)
          .then(onSetDocument())
          .catch(error => {
            console.error("Error on setting User document: ", error);
          });
      } else {
        console.log(
          "The User document already contained the user's boardgame and did not need to be updated"
        );
      }
    })
    .catch(error => {
      console.error("Error on getting User document: ", error);
    });
};

/**
 * Get a DocumentReference to a game. It can be used to populate properties before actually saving the game
 * This helper method is not used in the app
 *
 * @param {string} game_id - The document ID
 * @return {DocumentReference} - A reference to a document in firebase firestore
 */
export const getGameReference = game_id => {
  var fire_game;
  if (game_id) {
    fire_game = fire_games.doc(game_id);
  } else {
    fire_game = fire_games.doc();
  }
  return fire_game;
};

/**
 * Save a Game reference
 * This helper method is not used in the app
 *
 * @param {*} fire_game - An existing DocumentReference to a user
 * @param {*} data_game - The user data to be set
 * @callback [onSetDocument] - Callback triggering when User document is successfully set
 */
export const setGameReference = (
  fire_game,
  data_game,
  onSetDocument = () => {}
) => {
  fire_game
    .set(data_game)
    .then(() => {
      onSetDocument();
    })
    .catch(function(error) {
      console.error("setGameReference: Error writing document: ", error);
    });
};

/**
 * Append a game to a User document
 *
 * @param {string} category - Boardgame status e.g. 'owned', 'whishlist'
 * @param {string[]} thing_ids - Array with game IDs from BGG
 * @param {string[]} owners - Array with game owners
 * @param {*} data - Data to be set in the Game document. It should contain the game owner in the lastEditor field
 * @callback [onSetDocument] - Callback triggering on a successful update of the Comment document
 */
export const removeGamesFromGamesCollection = (
  category,
  thing_ids,
  owners,
  data,
  onSetDocument = () => {}
) => {
  var fire_allgames = fire_games.doc(category);
  let edited = 0;
  fire_allgames
    .get()
    .then(doc => {
      var document = doc.data();
      /*if (!document) {
        document = { thing_ids: [], names: [], owners: [] };
      }*/
      [document, edited] = removeGamesFromGamesData(
        document,
        thing_ids,
        owners
      );
      // Save the Game document to Firebase only if it was modified
      if (edited) {
        //Store last edit info
        document = { ...document, ...data };
        fire_allgames
          .set(document)
          .then(onSetDocument())
          .catch(error => {
            console.error("Error on setting User document: ", error);
          });
      } else {
        console.log(
          "The Game document did not contain the user's boardgame so it did not need to be updated"
        );
      }
    })
    .catch(error => {
      console.error("Error on getting Game document: ", error);
    });
};

/**
 * Remove games from a User document
 *
 * @param {string} owner - Boardgame owner, which in firebase is the key for the Users collection
 * @param {string} category - Boardgame status e.g. 'owned', 'whishlist'
 * @param {string[]} thing_ids - Array with game IDs from BGG
 * @param {*} data - Data to be set in the Game document. It should contain the game owner in the lastEditor field
 * @callback [onSetDocument] - Callback triggering on a successful update of the Comment document
 */
export const removeGamesFromUsersCollection = (
  owner,
  category,
  thing_ids,
  data,
  onSetDocument = () => {}
) => {
  const fire_user = getUserReference(owner);
  let edited = 0;
  fire_user
    .get()
    .then(doc => {
      var document = doc.data();
      /*if (!document) {
          document = { thing_ids: [], names: [], owners: [] };
        }*/
      [document, edited] = removeGamesFromUserData(document, thing_ids, [
        category
      ]);
      // Save the Game document to Firebase only if it was modified
      if (edited) {
        //Store last edit info
        document = { ...document, ...data };
        fire_user
          .set(document)
          .then(onSetDocument())
          .catch(error => {
            console.error("Error on setting User document: ", error);
          });
      } else {
        console.log(
          "The Game document did not contain the boardgame so it did not need to be updated"
        );
      }
    })
    .catch(error => {
      console.error("Error on getting Game document: ", error);
    });
};
