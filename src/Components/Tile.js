import React, { Component } from "react";
import axios from "axios";
import { Container, Row, Col } from "reactstrap";
import { getInfoFromThingAPI } from "../Scripts/Utilities";
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
    doc: undefined,
    addGame: this.props.addGame,
    removeGame: this.props.removeGame
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

  render() {
    let { doc } = this.state;
    //let url = buildURL(this.props.thing_id, { stats: 1 });
    let obj = getInfoFromThingAPI(doc)
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
                <h5 className="vcenter game_info">
                  <div className="game_name">{obj.gameName + " "}
                    {"(" + obj.yearpublished + ")"}
                  </div>
                </h5>
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
                  <b>{obj.playingtime}</b>
                </p>
                <p className="game_data centered">Play time (mins)</p>
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
