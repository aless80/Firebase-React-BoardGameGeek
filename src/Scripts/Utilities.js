/**
 * extract values from the parsed XML response
 *
 * @param doc {object} - The parsed XMLresponse
 * @param elem {string} - An element from which one extracts information. Filter on <elem>.<attrOut>
 * @param [attr] {string} - Optional. Attribute to allow filtering on <elem>.<attr> === <attrFilter>
 * @param [attrFilter] {string} - Optional. Attribute value to allow filtering on <elem>.<attr> === <attrFilter>
 * @param attrOut {string} - The attribute value to return as output. Default: value.
 * @return {string[]} - Array of strings
 */

export const extractValueFromElement = (
  doc,
  elem,
  attr,
  attrFilter,
  attrOut = "value"
) => {
  // Get elements <elem>
  let linksHTMLCollection = doc.getElementsByTagName(elem);
  let elements = Array.from(linksHTMLCollection);
  // Filter on <elem>.<attrOut>. This also prevents errors
  elements = elements.filter(x => x.attributes.hasOwnProperty(attrOut));
  // Filter on <elem>.<attr> === <attrFilter>
  if (attrFilter !== "") {
    elements = elements.filter(
      x => x.attributes[attr].nodeValue === attrFilter
    );
  }
  // Return an array of strings, the strings are given by <attrOut>
  return elements.map(x => x.attributes[attrOut].nodeValue);
};

/**
 * extract values from the parsed XML response
 *
 * @param doc {object} - The parsed XMLresponse
 * @param elem {string} - An element from which one extracts information. Filter on <elem>.<attrOut>
 * @param attrOut {string} - The attribute value to return as output. Default: value
 * @param [attr] {string} - Optional. Attribute to allow filtering on <elem>.<attr> === <attrFilter>
 * @param [attrFilter] {string} - Optional. Attribute value to allow filtering on <elem>.<attr> === <attrFilter>
 * @return {string[]} - Array of strings, i.e. the attributes <attrOut> for all elements <elem>
 */
export const extractValueFromElements = (
  doc,
  elem,
  attrOut = "value",
  attr = "",
  attrFilter = ""
) => {
  // Get elements <elem>
  let linksHTMLCollection = doc.getElementsByTagName(elem);
  let elements = Array.from(linksHTMLCollection);
  // Filter on <elem>.<attrOut>. This also prevents errors
  elements = elements.filter(x => x.attributes.hasOwnProperty(attrOut));
  // Filter on <elem>.<attr> === <attrFilter>
  if (attrFilter !== "") {
    elements = elements.filter(
      x => x.attributes[attr].nodeValue === attrFilter
    );
  }
  // Return an array of strings, the strings are given by <attrOut>
  return elements.map(x => x.attributes[attrOut].nodeValue);
};

/**
 * extract values from the parsed XML response
 *
 * @param doc {object} - The parsed XMLresponse
 * @param elem {string} - An element from which one extracts information
 * @param [attr] {string} - Optional. Attribute to allow filtering on <elem>.<attr> === <attrFilter>
 * @param [attrFilter] {string} - Optional. Attribute value to allow filtering on <elem>.<attr> === <attrFilter>
 * @return {string[]} - Array of strings, i.e. textContent  for all elements <elem>
 */
export const extractTextContentFromElements = (
  doc,
  elem,
  attr = "",
  attrFilter = ""
) => {
  // Get elements <elem>
  let linksHTMLCollection = doc.getElementsByTagName(elem);
  let elements = Array.from(linksHTMLCollection);
  // Filter on <elem>.<attrOut>. This also prevents errors
  //elements = elements.filter(x => x.attributes.hasOwnProperty(attrOut));
  // Filter on <elem>.<attr> === <attrFilter>
  if (attrFilter !== "") {
    elements = elements.filter(
      x => x.attributes[attr].nodeValue === attrFilter
    );
  }
  // Return an array of strings, the strings are given by <attrOut>
  //return elements.map(x => x.attributes[attrOut].nodeValue);
  return elements.map(x => x.textContent);
};

/**
 * Helper method to find the index of the maximum in an array
 *
 * @param {array} - Array
 */
export const indexOfMax = arr => {
  if (arr.length === 0) {
    return -1;
  }
  var max = arr[0];
  var maxIndex = 0;
  for (var i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      maxIndex = i;
      max = arr[i];
    }
  }
  return maxIndex;
};

/**
 * Extract information from BGG's "Thing Items" API (see https://boardgamegeek.com/wiki/page/BGG_XML_API2)
 *
 * @param doc {object} - The parsed XMLresponse
 * @return {object} - Object containing the parsed information
 */
export const getInfoFromThingAPI = doc => {
  let obj = {};
  if (typeof doc !== "undefined") {
    obj["gameName"] = doc.getElementsByTagName("name")[0].getAttribute("value");
    try {
      // The API can returned malformed info (e.g. the qwerty game)!
      obj["img_src"] = doc.getElementsByTagName(
        "image"
      )[0].childNodes[0].nodeValue;
    } catch (error) {
      obj["img_src"] =
        "https://via.placeholder.com/450/0000FF/FFF?text=No+image+available";
    }
    [
      "yearpublished",
      "minplayers",
      "maxplayers",
      "playingtime",
      "minplaytime",
      "maxplaytime",
      // Stats
      "usersrated",
      "average",
      "stddev",
      "averageweight"
    ].forEach(attr => {
      try {
        obj[attr] = doc.getElementsByTagName(
          attr
        )[0].attributes.value.nodeValue;
      } catch (error) {
        obj[attr] = "";
      }
    });
    // Link with game characteristics
    // Example: <link type="boardgamecategory" id="1026" value="Negotiation"/>
    obj["boardgamecategory"] = extractValueFromElements(
      doc,
      "link",
      "value",
      "type",
      "boardgamecategory"
    ).join(", ");
    // Example: <link type="boardgamemechanic" id="2072" value="Dice Rolling"/>
    obj["boardgamemechanic"] = extractValueFromElements(
      doc,
      "link",
      "value",
      "type",
      "boardgamemechanic"
    ).join(", ");
    // Polls
    // Extract two arrays with this information
    // <results numplayers="3">
    //   <result value="Best" numvotes="421"/> ..
    let numplayers = extractValueFromElements(doc, "results", "numplayers");
    let numvotes = extractValueFromElements(
      doc,
      "result",
      "numvotes",
      "value",
      "Best"
    );
    obj["bestnplayers"] = numplayers[indexOfMax(numvotes)];
  }
  return obj;
};

/**
 * format numbers with leading zeroes
 *
 * @param integer {integer} - An integer
 * @param [width] {integer} - How many numbers the returned value should have
 * @return {string} - String representing a number with leading zeroes
 */
export const leadingZeros = (integer, width = 6) => {
  width -= integer.toString().length;
  if (width > 0) {
    return new Array(width + (/\./.test(integer) ? 2 : 1)).join("0") + integer;
  }
  return integer + "";
};

/**
 * Set the games information stored to the browser's session storage
 *
 * @param gamesData {object} - Object with the games data
 * @param [key] {string} - Key in session storage for the games data
 */
export const setSessionStorage = (gamesData, key = "localGames") => {
  if (typeof gamesData != "undefined") {
    sessionStorage.setItem(key, JSON.stringify(gamesData));
  } else {
    console.warn("Games data is undefined");
  }
};

/**
 * Get the games information stored in the browser's session storage
 *
 * @param integer {integer} - An integer
 * @param [key] {string} -
 * @return {string} - Object with the games
 */
export const getSessionStorage = (key = "localGames") => {
  let stringifiedGames = sessionStorage.getItem(key);
  if (stringifiedGames === null) {
    console.log("No '" + key + "' key found in session storage");
    return "";
  }
  return JSON.parse(stringifiedGames);
};

/**
 * Get the owners for a game
 *
 * @param gameid {integer} - gameid from BGG
 * @param [games_data] {object} - The games object to look into. Should have the standard format defined in Firebase for this app
 * @return {string} - Comma separated list of owners
 */
export const getOwnersForGame = (gameid, games_data) => {
  if (!games_data.hasOwnProperty("thing_ids")) {
    return "";
  }
  let ind = games_data.thing_ids.indexOf(gameid);
  if (ind < 0) {
    return "";
  }
  return games_data.owners[ind];
};

/**
 * Check if a user owns a game the owners for a game
 *
 * @param username {string} - Username
 * @param [games_data] {object} - The games object to look into. Should have the standard format defined in Firebase for this app
 * @return {boolean]} - Return wether the user owns the game
 */
export const isGameOwned = (owner, gameid, games_data) => {
  let owners = getOwnersForGame(gameid, games_data);
  //console.log('isGameOwned: owner, gameid, games_data:', owners.indexOf(owner) >= 0, owner, gameid, games_data)
  return owners.indexOf(owner) >= 0;
};

/**
 * Add data to an object representing a firebase User collection
 *
 * @param user_data {object} - User data object. Can be empty
 * @param thing_ids {string[]} - Array of BGG IDs for boardgames
 * @param names {string[]} - Array of names for BGG boardgames
 * @param categories {string[]} - Array of Categories for boardgames, which in Firebase become the Document ID in the Games collection
 * @return {array[user_data, integer]} - Array of length 2 containing the new user_data object and an "edited" integer 0/1 returning whether user_data was edited
 */
export const addGameToUserData = (user_data, thing_ids, names, categories) => {
  let edited = 0;
  if (
    !user_data ||
    !user_data.hasOwnProperty("thing_ids") ||
    !user_data.hasOwnProperty("names") ||
    !user_data.hasOwnProperty("categories")
  ) {
    user_data = { thing_ids: [], names: [], categories: [] };
  }
  thing_ids.forEach((thing_id, ind) => {
    const thing_id_ind = user_data["thing_ids"].indexOf(thing_id);
    if (thing_id_ind === -1) {
      // Adding a new boardgame to the User data
      edited = 1;
      user_data["thing_ids"].push(thing_id);
      user_data["names"].push(names[ind]);
      user_data["categories"].push(categories[ind]);
    } else {
      // Game already owned by other users
      if (
        user_data["categories"][thing_id_ind]
          .split(",")
          .indexOf(categories[ind]) === -1
      ) {
        // Game was already stored but with a different category
        edited = 1;
        if (user_data["categories"][thing_id_ind].length) {
          user_data["categories"][thing_id_ind] += ",";
        }
        user_data["categories"][thing_id_ind] += categories[ind];
      }
    }
  });
  return [user_data, edited];
};

/**
 * Add data to an object representing a firebase Games collection
 *
 * @param games_data {object} - Games data object. Can be empty
 * @param thing_ids {string[]} - Array of BGG IDs for boardgames
 * @param names {string[]} - Array of names for BGG boardgames
 * @param owners {string[]} - Array of owners for boardgames
 * @return {array[games_data, integer]} - Array of length 2 containing the new games_data object and an "edited" integer 0/1 returning whether user_data was edited
 */
export const addGameToGamesData = (games_data, thing_ids, names, owners) => {
  let edited = 0;
  if (
    !games_data ||
    !games_data.hasOwnProperty("thing_ids") ||
    !games_data.hasOwnProperty("names") ||
    !games_data.hasOwnProperty("owners")
  ) {
    games_data = { thing_ids: [], names: [], owners: [] };
  }
  thing_ids.forEach((thing_id, ind) => {
    const thing_id_ind = games_data["thing_ids"].indexOf(thing_id);
    if (thing_id_ind === -1) {
      // Add a new game
      edited = 1;
      games_data["thing_ids"].push(thing_id);
      games_data["names"].push(names[ind]);
      games_data["owners"].push(owners[ind]);
    } else {
      // Game already exists in some user's data
      if (
        games_data["owners"][thing_id_ind].split(",").indexOf(owners[ind]) ===
        -1
      ) {
        edited = 1;
        if (games_data["owners"][thing_id_ind].length) {
          games_data["owners"][thing_id_ind] += ",";
        }
        games_data["owners"][thing_id_ind] += owners[ind];
      }
    }
  });
  return [games_data, edited];
};

/**
 * Remove games from an object representing a firebase User collection
 *
 * @param user_data {object} - User data object. Can be empty
 * @param thing_ids {string[]} - Array of BGG IDs for boardgames
 * @param names {string[]} - Array of names for BGG boardgames
 * @param categories {string[]} - Array of Categories for boardgames, which in Firebase become the Document ID in the Games collection
 * @return {user_data, integer} - Array of length 2 containing the new user_data object and an "edited" integer 0/1 returning whether user_data was edited
 */
export const removeGamesFromUserData = (user_data, thing_ids, categories) => {
  let edited = 0;
  if (!user_data) {
    //user_data = { thing_ids: [], names: [], categories: [] };
  }
  thing_ids.forEach((thing_id, ind) => {
    let thing_id_ind = -1;
    if (user_data.hasOwnProperty("thing_ids")) {
      thing_id_ind = user_data["thing_ids"].indexOf(thing_id);
    }
    if (thing_id_ind >= 0) {
      // Removing a boardgame from the User data
      edited = 1;
      user_data["thing_ids"].splice(thing_id_ind, 1);
      user_data["names"].splice(thing_id_ind, 1);
      categories.forEach(category => {
        user_data["categories"].splice(
          user_data["categories"].indexOf(category),
          1
        );
      });
    } else {
      // Game not present in User data
    }
  });
  return [user_data, edited];
};

/**
 * Remove games from an object representing a firebase Games collection
 *
 * @param games_data {object} - Games data object. Can be empty
 * @param thing_ids {string[]} - Array of BGG IDs for boardgames
 * @param owners {string[]} - Array of owners for boardgames
 * @return {array[games_data, integer]} - Array of length 2 containing the new games_data object and an "edited" integer 0/1 returning whether user_data was edited
 */
export const removeGamesFromGamesData = (games_data, thing_ids, owners) => {
  let edited = 0;
  if (!games_data) {
    //games_data = { thing_ids: [], names: [], owners: [] };
  }
  thing_ids.forEach((thing_id, ind) => {
    let thing_id_ind = -1;
    if (games_data.hasOwnProperty("thing_ids")) {
      thing_id_ind = games_data["thing_ids"].indexOf(thing_id);
    }
    if (thing_id_ind >= 0) {
      // Removing a boardgame from the Games data
      edited = 1;
      games_data["thing_ids"].splice(thing_id_ind, 1);
      games_data["names"].splice(thing_id_ind, 1);
      owners.forEach(owner => {
        games_data["owners"].splice(games_data["owners"].indexOf(owner), 1);
      });
    } else {
      // Game not present in Games data
    }
  });
  return [games_data, edited];
};
