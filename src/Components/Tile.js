import React, { Component } from "react";
import axios from "axios";
import { extractValueFromElements } from "../Scripts/Utilities";
//import { Container, ListGroup, ListGroupItem } from "reactstrap";
//import { CSSTransition, TransitionGroup } from "react-transition-group";
import { Container, Row, Col } from "reactstrap";
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
    //xml: undefined,
    doc: undefined
  };

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
        //console.log("xml:", xml);
        console.log("Tile:", queryUrl);
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
    let url = buildURL(this.props.thing_id, { stats: 1 });
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
            <Row className="tile_row">
              <Col sm="3">
                <img
                  className="game_img"
                  src={obj.img_src}
                  alt="img"
                  style={{ display:"inline-block", alignItems: "center" }}
                />
              </Col>
              <Col
                sm="6"
                style={{
                  borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRight: "1px solid rgba(255, 255, 255, 0.1)",
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
                }}
              >
                <Container>
                  <Row>
                    <Col sm="3">
                      <div className="hex">
                        <div
                          class="rating"
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
                          {parseFloat(obj.average).toFixed(1)}
                        </div>
                      </div>
                    </Col>
                    <Col sm="7">
                      <h3>{obj.gameName + " (" + obj.yearpublished + ")"}</h3>
                    </Col>
                    <Col sm="1">
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <h3>Link</h3>
                      </a>
                    </Col>
                    <Col sm="1" />
                  </Row>
                </Container>
                <br />
                <Container>
                  <Row>
                    <Col
                      style={{
                        borderRight: "1px solid rgba(255, 255, 255, 0.1)",
                        borderTop: "1px solid rgba(255, 255, 255, 0.1)"
                      }}
                    >
                      <p>
                        <b>
                          {obj.minplayers + "-" + obj.maxplayers + " Players"}
                        </b>
                      </p>
                      <p>Best {obj.bestnplayers}</p>
                    </Col>
                    <Col
                      style={{
                        borderRight: "1px solid rgba(255, 255, 255, 0.1)",
                        borderTop: "1px solid rgba(255, 255, 255, 0.1)"
                      }}
                    >
                      <p
                        title={
                          " (" +
                          obj.minplaytime +
                          "-" +
                          obj.maxplaytime +
                          ") Min"
                        }
                      >
                        <b>{obj.playingtime + " Min"}</b>
                      </p>
                      <p>Playing time</p>
                    </Col>
                    <Col
                      style={{
                        borderTop: "1px solid rgba(255, 255, 255, 0.1)"
                      }}
                    >
                      <p>
                        <b>
                          {"Weight: " +
                            parseFloat(obj.averageweight).toFixed(1) +
                            " / 5"}
                        </b>
                      </p>
                    </Col>
                  </Row>
                </Container>
                <br />
                <Container>
                  <Row>
                    <Col
                      sm={{ size: 6, order: 1 }}
                      style={{
                        borderTop: "1px solid rgba(255, 255, 255, 0.1)"
                      }}
                    >
                      <p>
                        <b>Game mechanics</b>
                      </p>
                      <p>{obj.boardgamemechanic}</p>
                    </Col>
                    <Col
                      sm={{ size: 6, order: 2 }}
                      style={{
                        borderTop: "1px solid rgba(255, 255, 255, 0.1)"
                      }}
                    >
                      <p>
                        <b>Category</b>
                      </p>
                      <p>{obj.boardgamecategory}</p>
                    </Col>
                  </Row>
                </Container>
              </Col>
              <Col sm="3">
                <p>
                  <b>Owners TODO: </b>
                </p>
                <p>{obj.boardgamemechanic}</p>
              </Col>
            </Row>
            <br />
          </Container>
        )}
      </div>
    );
  }
}
