/**
 * Helper method to extract values from the parsed XML response
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
 * Helper method to extract values from the parsed XML response
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
 * Helper method to extract values from the parsed XML response
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
 * Helper method to format numbers with leading zeroes
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
 * Helper method to set the games information stored to the browser's session storage
 *
 * @param gamesData {object} - Object with the games data
 * @param [key] {string} - Key in session storage for the games data
 */
export const setSessionStorage = (gamesData, key = "localGames") => {
  if (typeof gamesData != "undefined") {
    sessionStorage.setItem(key, JSON.stringify(gamesData));
  } else {
    console.error("Input gamesData not valid");
  }
};

/**
 * Helper method to get the games information stored in the browser's session storage
 *
 * @param integer {integer} - An integer
 * @param [key] {string} -
 * @return {string} - Object with the games
 */
export const getSessionStorage = (key = "localGames") => {
  let stringifiedGames = sessionStorage.getItem(key);
  if (stringifiedGames === null) {
    console.log("No '" + key + "' key found in session storage");
    return ''
  }
  let ret = JSON.parse(stringifiedGames)
  return ret;
};
