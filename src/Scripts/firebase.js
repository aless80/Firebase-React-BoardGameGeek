import firebase from "../Firebase";

/**
 * Cloud Storage
 *
 * @return {Object}
 */
export const storage = firebase.storage();

/**
 * Store file to path in Firebase Storage
 *
 * @param {String} storagePath - Path in Firebase storage where the file gets stored, e.g. the post_key
 * @param {File} file - The file as a File object
 * @param {UploadMetadata} metadata - Metadata for the newly uploaded object
 * @callback [onUploadProgress] - Callback on upload progress triggering when the file is being uploading.
 * @callback [onSuccessfulUpload] - Callback on the file URL triggering when the file is successfully uploaded
 * @callback [onError] - Callback on error message and object triggering when the upload encounters an error
 */
export const uploadToStorage = (
  storagePath,
  file,
  metadata = {},
  onUploadProgress = p => {},
  onSuccessfulUpload = (msg, url) => {},
  onError = err => {}
) => {
  var ref = storage.ref(storagePath).child(file.name);
  // Example for metadata
  /*var metadata = {
    contentType: 'image/jpeg',
    customMetadata: {timestamp: <somedate>}
  };*/
  var uploadTask = ref.put(file, metadata);
  // Register three observers:
  // 1. 'state_changed' observer, called any time the state changes
  // 2. Error observer, called on failure
  // 3. Completion observer, called on successful completion

  uploadTask.on(
    "state_changed",
    snapshot => {
      // Observe state change events such as progress, pause, and resume
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      var uploadProgress =
        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      onUploadProgress(uploadProgress);
      switch (snapshot.state) {
        case "paused":
          console.log("Upload is paused");
          break;
        case "running":
          break;
        default:
          break;
      }
    },
    error => {
      // A full list of error codes is available at
      // https://firebase.google.com/docs/storage/web/handle-errors
      let msg = "";
      switch (error.code) {
        case "storage/unauthorized":
          msg =
            error.code +
            " error: user does not have permission to access the object. Make sure the size fo the file is less than 1MB";
          break;
        case "storage/canceled":
          msg = error.code + " error: user canceled the upload";
          break;
        case "storage/unknown":
          msg =
            error.code +
            " error: unknown error occurred, inspect error.serverResponse";
          break;
        default:
          msg =
            error.code +
            " error: unknown error occurred, inspect error.serverResponse";
          break;
      }
      onError(msg, error);
      //Unsubscribe after error
      uploadTask();
    },
    complete => {
      // Handle successful uploads on complete
      // For instance, get the download URL: https://firebasestorage.googleapis.com/...
      uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
        onSuccessfulUpload(downloadURL);
      });
      //Unsubscribe after complete
      uploadTask();
    }
  );
  return uploadTask;
};

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
        console.error("No such User document");
      }
    });
};

/**
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
 * Get a DocumentReference to a user. It can be used to populate properties before actually saving the user
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
 * Get a DocumentReference to a game. It can be used to populate properties before actually saving the game
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
 * Save a Game reference
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
 * @param {string[]} names - Array with game names from BGG
 * @param {*} data - Data to be set in the Game document. It should contain the game owner in the lastEditor field
 * @callback [onSetDocument] - Callback triggering on a successful update of the Comment document
 *
 */
export const pushGames = (
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
      if (!document) {
        document = { thing_ids: [], names: [], owners: [] };
      }
      thing_ids.forEach((thing_id, ind) => {
        const owner = getUserName();
        const thing_id_ind = document["thing_ids"].indexOf(thing_id);
        if (thing_id_ind === -1) {
          edited = 1;
          document["thing_ids"].push(thing_id);
          document["names"].push(names[ind]);
          document["owners"].push(owner);
        } else {
          if (
            document["owners"][thing_id_ind].split(",").indexOf(owner) === -1
          ) {
            edited = 1;
            if (document["owners"][thing_id_ind].length) {
              document["owners"][thing_id_ind] += ",";
            }
            document["owners"][thing_id_ind] += owner;
          }
        }
      });
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
 * @param {string} categories - Boardgame status e.g. 'owned', 'whishlist'
 * ---@param {string} owner - The username/boardgame owner
 * @param {string[]} thing_ids - Array with game IDs from BGG
 * @param {string[]} names - Array with game names from BGG
 * @param {*} data - Data to be set in the Game document
 * @callback [onSetDocument] - Callback triggering on a successful update of the Comment document
 *
 */
export const pushGamesToUser = (
  categories,
  thing_ids,
  names,
  data,
  onSetDocument = () => {}
) => {
  const owner = getUserName();
  const fire_user = getUserReference(owner);
  let edited = 0;
  fire_user
    .get()
    .then(doc => {
      var document = doc.data();
      if (!document) {
        document = { thing_ids: [], names: [], categories: [] };
      }
      thing_ids.forEach((thing_id, ind) => {
        const thing_id_ind = document["thing_ids"].indexOf(thing_id);
        if (thing_id_ind === -1) {
          // Adding a new boardgame to the User document
          edited = 1;
          document["thing_ids"].push(thing_id);
          document["names"].push(names[ind]);
          document["categories"].push(categories[ind]);
        } else {
          // Game already owned by other users
          if (
            document["categories"][thing_id_ind]
              .split(",")
              .indexOf(categories[ind]) === -1
          ) {
            edited = 1;
            if (document["categories"][thing_id_ind].length) {
              document["categories"][thing_id_ind] += ",";
            }
            document["categories"][thing_id_ind] += categories[ind];
          }
        }
      });
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
 * Append a game to a User document
 *
 * @param {string} username - The username
 * @param {string[]} thing_ids - Array with game IDs from BGG
 * @param {string[]} names - Array with game names from BGG
 * @param {*} data - Optional data for the User document
 * @callback [onSetDocument] - Callback triggering on a successful update of the Comment document
 *
 */
export const pushGamesToUserOLD = (
  username,
  thing_id,
  name,
  data,
  onSetDocument = () => {}
) => {
  const fire_user = getUserReference(username);
  fire_user
    .get()
    .then(doc => {
      var document = doc.data();
      if (!document) {
        document = { thing_id: [], name: [] };
      }
      document = { ...document, ...data };
      if (document["thing_id"].indexOf(thing_id) === -1) {
        return console.error(
          "Game already present in User document with username",
          username
        );
      }
      document["thing_id"].push(thing_id);
      document["name"].push(name);
      fire_user
        .set(document)
        .then(onSetDocument())
        .catch(error => {
          console.error("Error on setting User document: ", error);
        });
    })
    .catch(error => {
      console.error("Error on getting User document: ", error);
    });
};

/**
 * Get the number of documents in the User collection. Should work fine for small (<100) collections.
 * See https://stackoverflow.com/questions/46554091/firebase-firestore-collection-count/49407570
 *
 * @callback [onCommentSnapshot] - Callback on a query snapshot (e.g. use .size, .empty, .forEach) triggering when results are retrieved for the Comments collection
 */
export const userQuerySnapshot = onCommentSnapshot => {
  return fire_users.get().then(snap => {
    onCommentSnapshot(snap);
  });
};

/**
 * Update a User in firebase
 *
 * @param {string} user_key - The user id
 * @param {object} data_user - Object with key-value pairs to edit in the user document
 * @callback [onAfterupdate] - Callback triggering after a successfull update. No document available
 */
export const updateUser = (user_key, data_user, onAfterUpdate = () => {}) => {
  const fire_user_doc = fire_users.doc(user_key);
  fire_user_doc
    .get()
    .then(doc0 => {
      fire_user_doc
        .update({ ...doc0.data(), ...data_user })
        .then(() => {
          /* NB: no document available */
          onAfterUpdate();
        })
        .catch(error => {
          console.error("Error updating user document: ", error);
        });
    })
    .catch(error => {
      console.error("Error getting a user: ", error);
    });
};

/**
 * Update a comment document
 *
 * @param {string} user_key - The user id
 * @param {string} commentid - The comment key
 * @param {object} data_comment - Object with key-value pairs to edit in the comment document
 * @callback [onAfterSetDocument] - Callback triggering on a successful write of the Comment document (e.g. window.location.reload())
 */
export const updateComment = (
  user_key,
  commentid,
  data_comment,
  onAfterSetDocument = () => {}
) => {
  const fire_comment_doc = fire_games.doc(user_key);
  fire_comment_doc
    .get()
    .then(doc0 => {
      var document = { ...doc0.data() };
      document[commentid] = { ...document[commentid], ...data_comment };
      fire_comment_doc
        .set(document)
        .then(onAfterSetDocument())
        .catch(error => {
          console.error("Error on setting comment: ", error);
        });
    })
    .catch(error => {
      console.error("Error on getting comment: ", error);
      return;
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