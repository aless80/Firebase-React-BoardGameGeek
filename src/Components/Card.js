import React, { Component } from "react";
import axios from "axios";
import { getInfoFromThingAPI } from "../Scripts/Utilities";
import { Container, Row, Col } from "reactstrap";
import "./Card.css";
import AddGame from "./AddGame";
import RemoveGame from "./RemoveGame";

// Construct the URL for API calls
// value is the thing id
// params (required): parameters object including stats
const buildURL = (value, params) => {
  let stats = params.stats;
  let queryUrl = `https://www.boardgamegeek.com/xmlapi2/thing?id=${value}&stats=${stats}`;
  return queryUrl;
};

export default class Card extends Component {
  state = {
    thing_id: this.props.thing_id,
    doc: undefined,
    addGame: this.props.addGame,
    removeGame: this.props.removeGame
  };
  owners = this.props.owners;

  componentDidUpdate(prevProps, prevState, snapshot) {
    //Always compare props
    if (this.props.thing_id !== prevProps.thing_id) {
      this.queryBGGThing(this.props.thing_id);
    }
    if (
      this.props.addGame !== prevProps.addGame ||
      this.props.removeGame !== prevProps.removeGame
    ) {
      this.setState({
        ...this.state,
        addGame: this.props.addGame,
        removeGame: this.props.removeGame
      });
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
        console.log("Card:", queryUrl);
        let doc = new DOMParser().parseFromString(xml.data, "text/xml");
        this.setState({ ...this.state, doc });
      })
      .catch(err => console.error("Error on calling the API::", err));
  }

  render() {
    let { doc } = this.state;
    let url = buildURL(this.props.thing_id, { stats: 1 });
    let obj = getInfoFromThingAPI(doc)
    return (
      <div>
        {doc === "undefined" && <div className="spinner" />}
        {typeof doc !== "undefined" && (
          <Container className="card_container">
            <Row className="card_row">&nbsp;</Row>
            <Row className="card_row">
              <Col sm="3">
                <div className="img_container">
                  <img
                    className="game_img"
                    src={obj.img_src}
                    alt="img"
                    style={{ display: "inline-block", alignItems: "center" }}
                  />
                  <div className="game_actions">
                    {this.state.addGame && (
                      <AddGame
                        thing_id={this.state.thing_id}
                        name={obj.gameName}
                        onAddedGames={(game_ids, game_names) => {
                          this.props.onAddedGames(game_ids, game_names);
                          this.setState({
                            ...this.state,
                            addGame: false,
                            removeGame: true
                          });
                        }}
                      />
                    )}
                    {this.state.removeGame && (
                      <RemoveGame
                        thing_id={this.state.thing_id}
                        name={obj.gameName}
                        onRemovedGames={(game_ids, game_names) => {
                          this.props.onRemovedGames(game_ids, game_names);
                        }}

                      />
                    )}
                  </div>
                </div>

                {/*<br />
                <BottomNavigation
                  value={value}
                  onChange={(event, newValue) => {
                    setValue(newValue);
                  }}
                  showLabels
                  className=""
                >
                  <BottomNavigationAction label="Add" icon={<AddIcon />} />
                  <BottomNavigationAction
                    label="Remove"
                    icon={<DeleteIcon />}
                  />
                  <BottomNavigationAction label="Something" icon={<Icon />} />
                </BottomNavigation>*/}
              </Col>
              <Col sm={this.owners ? "6" : "9"}>
                <Container>
                  <Row>
                    <Col sm="3">
                      <div className="hexagon">
                        <div
                          className="rating"
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
                      <h5 className="vcenter">
                        {obj.gameName + " (" + obj.yearpublished + ")"}
                      </h5>
                    </Col>
                    <Col sm="1">
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <h3 className="vcenter">Link</h3>
                      </a>
                    </Col>
                    <Col sm="1" />
                  </Row>
                </Container>
                <br />
                <Container>
                  <Row>
                    <Col className="borderTop borderRight">
                      <p className="game_data centered">
                        <b>
                          {obj.minplayers !== obj.maxplayers
                            ? obj.minplayers + " - " + obj.maxplayers
                            : obj.minplayers}
                        </b>
                      </p>
                      <p className="game_data centered">
                        Best: {obj.bestnplayers}
                      </p>
                    </Col>
                    <Col className="borderRight borderTop">
                      <p
                        className="game_data centered"
                        title={
                          " (" +
                          obj.minplaytime +
                          "-" +
                          obj.maxplaytime +
                          ") Min"
                        }
                      >
                        <b>{obj.playingtime}</b>
                      </p>
                      <p className="game_data centered">Play time (mins)</p>
                    </Col>
                    <Col className="borderTop">
                      <p className="game_data centered">
                        <b>
                          {parseFloat(obj.averageweight).toFixed(1) + " / 5"}
                        </b>
                      </p>
                      <p className="game_data centered">Weight</p>
                    </Col>
                  </Row>
                </Container>
                <br />
                <Container>
                  <Row>
                    <Col sm={{ size: 6, order: 1 }} className="borderTop">
                      <p className="game_data">
                        <b>Game mechanics</b>
                      </p>
                      <p className="game_data">{obj.boardgamemechanic}</p>
                    </Col>
                    <Col className="borderTop" sm={{ size: 6, order: 2 }}>
                      <p className="game_data">
                        <b>Category</b>
                      </p>
                      <p className="game_data">{obj.boardgamecategory}</p>
                    </Col>
                  </Row>
                </Container>
              </Col>
              {this.owners && (
                <Col sm="3">
                  <p className="game_data">
                    <b>Owners</b>
                  </p>
                  <div className="owners">
                    {this.owners.split(",").map((owner, ind) => (
                      <p className="game_data" key={ind}>
                        {owner}
                      </p>
                    ))}
                  </div>
                </Col>
              )}
            </Row>
            <br />
          </Container>
        )}
      </div>
    );
  }
}
