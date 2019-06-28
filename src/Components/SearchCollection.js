import React, { Component } from "react";
import axios from "axios";
import {
  extractValueFromElements,
  extractTextContentFromElements
} from "../Scripts/Utilities";

// Construct the URL for API calls
// value is the username
// params (required): parameters object including stats
const buildAPIURL = (value, params) => {
  /*BGG: Note that the default (or using subtype=boardgame) returns both boardgame and boardgameexpansion's in your collection... but incorrectly gives subtype=boardgame for the expansions. Workaround is to use excludesubtype=boardgameexpansion and make a 2nd call asking for subtype=boardgameexpansion*/
  let queryUrl = `https://www.boardgamegeek.com/xmlapi2/collection?username=${value}&subtype=boardgame&own=1`;
  //NB: with &stats=1 you get some more info: minplayers maxplayers minplaytime maxplaytime
  console.log("queryUrl:", queryUrl);
  return queryUrl;
};

export default class SearchCollection extends Component {
  state = {
    error: ""
  };
  collection = "";

  queryBGGCollection(value) {
    let queryUrl = buildAPIURL(value, { stats: 1 });
    axios.create({
      baseURL: queryUrl,
      timeout: 1000
    });
    axios
      .get(queryUrl)
      .then(xml => {
        let doc = new DOMParser().parseFromString(xml.data, "text/xml");
        this.setState({ ...this.state, error: "" });
        this.processDoc(doc);
      })
      .catch(err => {
        let error = "Error on calling the API:" + err;
        console.error("error:", error);
        this.setState({ ...this.state, error });
      });
  }

  onchange(username) {
    this.collection = username;
  }
  onSubmit() {
    if (this.collection) {
      this.queryBGGCollection(this.collection);
    }
  }

  processDoc(doc) {
    if (typeof doc !== "undefined") {
      //Check if there is an error message
      let message = doc.getElementsByTagName("message");
      if (message.length) {
        console.error("Error message present in response:", message);
      }
    }
    let thing_ids = [];
    let names = [];
    // Check total number of items
    let totalitems = doc
      .getElementsByTagName("items")[0]
      .getAttribute("totalitems");
    if (totalitems === "0") {
      console.log(`Zero results for ${this.props.username}'s collection`);
    } else {
      // Link with game characteristics
      // Example: <link type="boardgamecategory" id="1026" value="Negotiation"/>
      thing_ids = extractValueFromElements(doc, "item", "objectid");
      names = extractTextContentFromElements(doc, "name");
    }
    this.props.passSelection(thing_ids, names);
  }

  render() {
    let { doc } = this.state;
    return (
      <div>
        {doc === "undefined" && <div className="spinner" />}
        <div>
          <input
            type="text"
            className="react-autosuggest__input"
            onChange={e => this.onchange(e.currentTarget.value)}
            placeholder="Type your BoardGameGeek username"
          />
          &nbsp;
          <button
            className="btn btn-bgn"
            type="submit"
            onClick={() => this.onSubmit()}
          >
            Submit
          </button>
          {this.state.error && (
            <div>
              <p>
                <strong>
                  Error on calling the collection API. Please try again.{" "}
                </strong>
              </p>
              <p>{this.state.error}</p>
            </div>
          )}
        </div>
        <br />
      </div>
    );
  }
}
