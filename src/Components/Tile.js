import React, { Component } from "react";
import axios from "axios";
import { Container, Row, Col } from "reactstrap";
import { extractValueFromElements } from "../Scripts/Utilities";
//import { Container, ListGroup, ListGroupItem } from "reactstrap";
//import { CSSTransition, TransitionGroup } from "react-transition-group";
import "./Tile.css";
// Construct the URL for API calls
// value is the thing id
// params (required): parameters object including stats
const buildURL = (value, params) => {
  let stats = params.stats;
  let queryUrl = `https://www.boardgamegeek.com/xmlapi2/thing?id=${value}&stats=${stats}`;
  return queryUrl;
};

export default class Tile extends Component {
  state = {
    thing_id: this.props.thing_id,
    doc: undefined
  };
  owners = undefined; //this.props.owners;

  componentDidUpdate(prevProps, prevState, snapshot) {
    //Always compare props
    if (this.props.thing_id !== prevProps.thing_id) {
      this.queryBGGThing(this.props.thing_id);
    }
  }

  componentDidMount() {
    this.queryBGGThing(this.props.thing_id);
  }

  queryBGGThing(value) {
    let queryUrl = buildURL(value, { stats: 1 });
    axios
      .get(queryUrl)
      .then(xml => {
        //console.log("Tile:", queryUrl);
        let doc = new DOMParser().parseFromString(xml.data, "text/xml");
        this.setState({ ...this.state, doc });
      })
      .catch(err => console.error("Error on calling the API::", err));
  }

  indexOfMax(arr) {
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
  }

  render() {
    let { doc } = this.state;
    //let url = buildURL(this.props.thing_id, { stats: 1 });
    let obj = {};
    if (typeof doc !== "undefined") {
      obj["gameName"] = doc
        .getElementsByTagName("name")[0]
        .getAttribute("value");
      obj["img_src"] = doc.getElementsByTagName(
        "image"
      )[0].childNodes[0].nodeValue;
      obj["yearpublished"] = doc.getElementsByTagName(
        "yearpublished"
      )[0].attributes.value.nodeValue;
      obj["minplayers"] = doc.getElementsByTagName(
        "minplayers"
      )[0].attributes.value.nodeValue;
      obj["maxplayers"] = doc.getElementsByTagName(
        "maxplayers"
      )[0].attributes.value.nodeValue;
      obj["playingtime"] = doc.getElementsByTagName(
        "playingtime"
      )[0].attributes.value.nodeValue;
      obj["minplaytime"] = doc.getElementsByTagName(
        "minplaytime"
      )[0].attributes.value.nodeValue;
      obj["maxplaytime"] = doc.getElementsByTagName(
        "maxplaytime"
      )[0].attributes.value.nodeValue;
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
      obj["bestnplayers"] = numplayers[this.indexOfMax(numvotes)];
      // Stats
      //obj[stats] = doc.getElementsByTagName("statistics")[0].attributes.value;
      obj["usersrated"] = doc.getElementsByTagName(
        "usersrated"
      )[0].attributes.value.nodeValue;
      obj["average"] = doc.getElementsByTagName(
        "average"
      )[0].attributes.value.nodeValue;
      obj["stddev"] = doc.getElementsByTagName(
        "stddev"
      )[0].attributes.value.nodeValue;
      obj["averageweight"] = doc.getElementsByTagName(
        "averageweight"
      )[0].attributes.value.nodeValue;
    }
    return (
      <div>
        {doc === "undefined" && <div className="spinner" />}
        {typeof doc !== "undefined" && (
          <Container className="tile_container">
            <Row>&nbsp;</Row>
            <Row className="">
              <Col sm="4">
                <img
                  className="game_img"
                  src={obj.img_src}
                  alt="img"
                  style={{ display: "inline-block", alignItems: "center" }}
                />
              </Col>
              <Col sm={this.owners ? "6" : "8"}>
                <h3 className="vcenter game_info">
                  <div className="game_name">{obj.gameName + " "}
                    {"(" + obj.yearpublished + ")"}
                  </div>
                </h3>
              </Col>
            </Row>
            <Row>&nbsp;</Row>
            <Row>
              <Col
                sm="3"
                className="borderTop borderRight"
                title={
                  "Rating: " +
                  parseFloat(obj.average).toFixed(1) +
                  "\u00B1" +
                  parseFloat(obj.stddev).toFixed(1) +
                  "\nRated by " +
                  obj.usersrated +
                  " users"
                }
              >
                <p className="game_data centered">
                  <b>{parseFloat(obj.average).toFixed(1)}</b>
                </p>
                <p className="game_data centered">Rating</p>
              </Col>
              <Col sm="3" className="borderRight borderTop">
                <p
                  className="game_data centered"
                  title={"Best:" + obj.bestnplayers}
                >
                  <b>
                    {obj.minplayers !== obj.maxplayers
                      ? obj.minplayers + " - " + obj.maxplayers
                      : obj.minplayers}
                  </b>
                </p>
                <p className="game_data centered">Players</p>
              </Col>
              <Col sm="3" className="borderTop borderRight">
                <p
                  className="game_data centered"
                  title={
                    " (" + obj.minplaytime + "-" + obj.maxplaytime + ") Min"
                  }
                >
                  <b>{obj.playingtime + " Min"}</b>
                </p>
                <p className="game_data centered">Play time</p>
              </Col>
              <Col sm="3" className="borderTop">
                <p className="game_data centered">
                  <b>{parseFloat(obj.averageweight).toFixed(1) + " / 5"}</b>
                </p>
                <p className="game_data centered">Weight</p>
              </Col>
            </Row>

            {/*this.owners && (
                <Col sm="3">
                  <p className="game_data">
                    <b>Owners</b>
                  </p>
                  {this.owners.split(",").map((owner, ind) => (
                    <p className="game_data" key={ind}>
                      {owner}
                    </p>
                  ))}
                </Col>
                  )*/}

            <br />
          </Container>
        )}
      </div>
    );
  }
}
