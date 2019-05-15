import React, { Component } from "react";
import axios from "axios";
import {
  extractValueFromElements,
  extractTextContentFromElements
} from "../Scripts/Utilities";
import Tile from "../Components/Tile";
//import { Container, ListGroup, ListGroupItem } from "reactstrap";
//import { CSSTransition, TransitionGroup } from "react-transition-group";

// Construct the URL for API calls
// value is the username
// params (required): parameters object including stats
const buildURL = (value, params) => {
  /*BGG: Note that the default (or using subtype=boardgame) returns both boardgame and boardgameexpansion's in your collection... but incorrectly gives subtype=boardgame for the expansions. Workaround is to use excludesubtype=boardgameexpansion and make a 2nd call asking for subtype=boardgameexpansion*/
  //let stats = params.;
  let queryUrl = `https://www.boardgamegeek.com/xmlapi2/collection?username=${value}&subtype=boardgame&own=1`; 
  //NB: with &stats=1 you get some more info: minplayers maxplayers minplaytime maxplaytime
  console.log("queryUrl:", queryUrl);
  return queryUrl;
};

export default class SearchCollection extends Component {
  state = {
    username: this.props.username, //NiceGuyMike
    //xml: undefined,
    doc: undefined,
    error: ""
  };
  collection = "";

  queryBGGCollection(value) {
    let queryUrl = buildURL(value, { stats: 1 });
    const instance = axios.create({
      baseURL: queryUrl,
      timeout: 1000
    });
    axios
      .get(queryUrl)
      .then(xml => {
        let doc = new DOMParser().parseFromString(xml.data, "text/xml");
        this.setState({ ...this.state, doc });
      })
      .catch(err => {
        let error = "Error on calling the API:" + err;
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

  render() {
    let { doc, error } = this.state;
    let url = buildURL(this.props.username, {});
    let obj = {};
    //var error = "";
    if (typeof doc !== "undefined") {
      //Check if there is an error message
      let message = doc.getElementsByTagName("message");
      // Check total number of items
      let totalitems = doc
        .getElementsByTagName("items")[0]
        .getAttribute("totalitems");
      if (totalitems === "0") {
        error = `Zero results for ${this.props.username}'s collection`;
        console.log("error:", error);
        //this.setState({ ...this.state, error });
      } else {
        // Link with game characteristics
        // Example: <link type="boardgamecategory" id="1026" value="Negotiation"/>
        obj["thing_ids"] = extractValueFromElements(doc, "item", "objectid");
        obj["subtypes"] = extractValueFromElements(doc, "subtype", "objectid");
        obj["names"] = extractTextContentFromElements(doc, "name");
        obj["years"] = extractTextContentFromElements(doc, "yearpublished");
        obj["images"] = extractTextContentFromElements(doc, "image");
        console.log("obj:", obj);
      }
    }
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
          {typeof doc !== "undefined" && (
            <div className="collResults">
              {this.state.error !== "" && <h3>{this.state.error}</h3>}
              {obj.thing_ids &&
                obj.thing_ids.map(gameid => (
                  <Tile key={gameid} thing_id={gameid} />
                ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}
