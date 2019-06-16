import React, { Component } from "react";
import axios from "axios";
import { extractValueFromElements } from "../Scripts/Utilities";
//import { Container, ListGroup, ListGroupItem } from "reactstrap";
//import { CSSTransition, TransitionGroup } from "react-transition-group";
import { Container, Row, Col } from "reactstrap";
import "./Tile.css";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
/*import Icon from "@material-ui/core/Icon";
import NavigationIcon from "@material-ui/icons/Navigation";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";
*/
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
                      <Fab
                        variant="extended"
                        size="small"
                        color="primary"
                        aria-label="Add"
                        className="fab_icon"
                        onClick={() => {
                          console.log("onClick add");
                        }}
                      >
                        <AddIcon className="" />
                        Add
                      </Fab>
                    )}
                    {this.state.removeGame && (
                      <Fab
                        variant="extended"
                        size="small"
                        color="secondary"
                        aria-label="Add"
                        className="fab_icon"
                        onClick={() => {
                          console.log("onClick rm");
                        }}
                      >
                        <DeleteIcon className="" disabled />
                        Remove
                      </Fab>
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
                      <h3 className="vcenter">
                        {obj.gameName + " (" + obj.yearpublished + ")"}
                      </h3>
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
