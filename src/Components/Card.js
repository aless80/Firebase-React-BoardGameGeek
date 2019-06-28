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
const buildAPIURL = (value, params) => {
  let stats = params.stats;
  return `https://www.boardgamegeek.com/xmlapi2/thing?id=${value}&stats=${stats}`;
};

// Construct the URL to the main page of BGG
// value is the thing id
// params (required): parameters object including stats
const buildURL = (value, params) => {
  return `https://boardgamegeek.com/boardgame/${value}`;
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
    let queryUrl = buildAPIURL(value, { stats: 1 });
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
    let apiUrl = buildAPIURL(this.props.thing_id, { stats: 1 });
    let url = buildURL(this.props.thing_id);
    let obj = getInfoFromThingAPI(doc);
    return (
      <div>
        {doc === "undefined" && <div className="spinner" />}
        {typeof doc !== "undefined" && (
          <Container className="card_container">
            <Row className="card_row display">
              <Col sm="3 game_img_col">
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
              <Col sm={this.owners ? "7" : "9"} className="game_header_col">
                <Container>
                  <Row className="game_header">
                    <Col sm="3" className="hexagon_col">
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
                    <Col sm="7" className="game_title_col">
                      <h4
                        className="vcenter"
                        title={obj.gameName + " (" + obj.yearpublished + ")"}
                      >
                        {obj.gameName + " (" + obj.yearpublished + ")"}
                      </h4>
                    </Col>
                    <Col sm="2" className="game_link_col">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Go to BoardGameGeek"
                      >
                        <h3 className="vcenter">Link</h3>
                      </a>
                    </Col>
                  </Row>
                </Container>
                <Container>
                  <Row className="stats">
                    <Col className="borderTop borderRight">
                      <p
                        className="game_data centered"
                        title={"Best:" + obj.bestnplayers}
                      >
                        <b>
                          {obj.minplayers !== obj.maxplayers
                            ? obj.minplayers + " - " + obj.maxplayers
                            : obj.minplayers}
                        </b>
                        <span>Players</span>
                      </p>
                    </Col>
                    <Col className="borderRight borderTop">
                      <p
                        className="game_data centered"
                        title={
                          obj.minplaytime + "-" + obj.maxplaytime + " mins"
                        }
                      >
                        <b>{obj.playingtime + "'"}</b>
                        <span>Playtime</span>
                      </p>
                    </Col>
                    <Col className="borderTop">
                      <p className="game_data centered">
                        <b>
                          {parseFloat(obj.averageweight).toFixed(1) + " / 5"}
                        </b>
                        <span>Weight</span>
                      </p>
                    </Col>
                  </Row>
                </Container>
                <Container>
                  <Row className="categories">
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
                <Col sm="2" className="owners">
                  <h4 >Owners</h4>
                  <div>
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
