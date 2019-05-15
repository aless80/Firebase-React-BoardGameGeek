import React from "react";
import Autosuggest from "react-autosuggest";
import axios from "axios";
import { extractValueFromElement } from "../Scripts/Utilities";
// See https://github.com/moroshko/react-autosuggest#on-suggestion-selected-prop

var timeout = undefined;

// Construct the URL for API calls
// value: the query
// params (required): parameters object including boardgame, boardgameaccessory, boardgameexpansion
const buildURL = (value, params) => {
  let exact = params.exact;
  let typesObj = {
    boardgame: params["boardgame"],
    boardgameaccessory: params["boardgameaccessory"],
    boardgameexpansion: params["boardgameexpansion"]
  };
  let types = Object.keys(typesObj)
    .filter(k => typesObj[k])
    .join(",");
  let queryUrl = `https://www.boardgamegeek.com/xmlapi2/search?query=${value}&exact=${exact}`;
  if (types !== "") {
    queryUrl += `&type=${types}`;
  }
  return queryUrl;
};

// Utility to build an array from the results in the API call
// that is suitable for Autosuggest's suggestions
const buildSuggestions = doc => {
  let gamesObj = [];
  let games = [];
  let years = [];
  let ids = [];
  if (typeof doc !== "undefined") {
    // Extract information from the parsed document
    games = extractValueFromElement(doc, "name", "type", "primary", "value");
    years = extractValueFromElement(doc, "yearpublished", "value", "", "value");
    ids = extractValueFromElement(doc, "item", "type", "boardgame", "id");
    // Build an array of objects
    games.forEach((game, i) => {
      // .slice(0, 10)
      gamesObj.push({ name: game, year: years[i], id: ids[i] });
    });
  }
  return gamesObj;
};

// Teach Autosuggest how to calculate the input value for every given suggestion.
const getSuggestionValue = suggestion => {
  return suggestion.name;
};

// Render the suggestion
const renderSuggestion = suggestion => {
  return <span>{suggestion.name}</span>;
};

class SearchBoardGame extends React.Component {
  state = {
    value: "",
    suggestions: [],
    exact: this.props.exact,
    boardgame: this.props.boardgame,
    boardgameaccessory: this.props.boardgameaccessory,
    boardgameexpansion: this.props.boardgameexpansion
  };
  lastRequestId = null;

  // Autosuggest will call this function every time you need to update suggestions.
  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({ suggestions: [] });
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      this.loadSuggestions(value);
    }, 500);
  };

  loadSuggestions(value) {
    // Cancel the previous request
    if (this.lastRequestId !== null) {
      clearTimeout(this.lastRequestId);
    }
    // Call API only when query has more than two letters
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    return inputLength < 2
      ? this.setState({ ...this.state, suggestions: [] })
      : this.queryAPI(value, {
          exact: this.state.exact,
          boardgame: this.state.boardgame,
          boardgameaccessory: this.state.boardgameaccessory,
          boardgameexpansion: this.state.boardgameexpansion
        });
  }

  // API call
  queryAPI(value, params) {
    let queryUrl = buildURL(value, params);
    axios
      .get(queryUrl)
      .then(xml => {
        let doc = new DOMParser().parseFromString(xml.data, "text/xml");
        let suggestions = buildSuggestions(doc);
        this.setState({ ...this.state, suggestions: suggestions });
        console.log(queryUrl);
      })
      .catch(err => console.error("err:", err));
  }

  // Handler that updates the state with the search term
  onChange = (event, { newValue }) => {
    this.setState({ ...this.state, value: newValue });
  };

  // Autosuggest will call this function every time you need to clear suggestions
  onSuggestionsClearRequested = () => {
    this.setState({ suggestions: [] }); //NB do not add ...this.state
  };

  // User toggles a checkbox
  onToggleCheckbox(event) {
    let param = event.target.id;
    let value = (parseInt(event.target.value) + 1) % 2;
    this.setState({ ...this.state, [param]: value });
  }

  // User clicks on a suggestion. Pass selection to parent
  onSuggestionSelected = (event, { suggestion }) => {
    this.props.passSelection(suggestion);
  };

  render() {
    const {
      value,
      suggestions,
      exact,
      boardgame,
      boardgameaccessory,
      boardgameexpansion
    } = this.state;
    const inputProps = {
      placeholder: "Type a boardgame",
      value,
      onChange: this.onChange,
      type: "search"
    };
    return (
      <div>
        <Autosuggest
          highlightFirstSuggestion={true}
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          onSuggestionSelected={this.onSuggestionSelected}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps}
        />
        <br />
        <span key="exact">
          <label>
            <input
              type="checkbox"
              id="exact"
              name="exact"
              value={exact}
              checked={exact === 1}
              onChange={event => this.onToggleCheckbox(event)}
            />
            &nbsp; Exact match &nbsp;&nbsp;
          </label>
        </span>
        <span key="boardgame">
          <label>
            <input
              type="checkbox"
              id="boardgame"
              name="boardgame"
              value={boardgame}
              checked={boardgame === 1}
              onChange={event => this.onToggleCheckbox(event)}
            />
            &nbsp; Boardgame &nbsp;&nbsp;
          </label>
        </span>
        <span key="boardgameexpansion">
          <label>
            <input
              type="checkbox"
              id="boardgameexpansion"
              name="boardgameexpansion"
              value={boardgameexpansion}
              checked={boardgameexpansion === 1}
              onChange={event => this.onToggleCheckbox(event)}
            />
            &nbsp; Expansion &nbsp;&nbsp;
          </label>
        </span>
        <span key="boardgameaccessory">
          <label>
            <input
              type="checkbox"
              id="boardgameaccessory"
              name="boardgameaccessory"
              value={boardgameaccessory}
              checked={boardgameaccessory === 1}
              onChange={event => this.onToggleCheckbox(event)}
            />
            &nbsp; Accessory &nbsp;&nbsp;
          </label>
        </span>
      </div>
    );
  }
}

export default SearchBoardGame;
