import React, { Component } from "react";
import axios from "axios";
import { extractValueFromElement } from "../Scripts/Utilities";
//import { Container, ListGroup, ListGroupItem } from "reactstrap";
//import { CSSTransition, TransitionGroup } from "react-transition-group";

export default class Tile extends Component {
  state = {
    thing_id: this.props.thing_id,
    //xml: undefined,
    doc: undefined
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    //Always compare props
    if (this.props.thing_id !== prevProps.thing_id) {
      this.queryThingBGG();
    }
  }

  componentDidMount() {
    this.queryThingBGG();
  }

  queryThingBGG() {
    let queryUrl = `https://www.boardgamegeek.com/xmlapi2/thing?id=${
      this.props.thing_id
    }&stats=1`;
    axios
      .get(queryUrl)
      .then(xml => {
        //console.log("xml:", xml);
        console.log("Tile:", queryUrl);
        let doc = new DOMParser().parseFromString(xml.data, "text/xml");
        this.setState({ ...this.state, doc });
      })
      .catch(err => console.error("err:", err));
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

  // TODO: put everything in an object
  render() {
    let { doc } = this.state;
    let url = `https://boardgamegeek.com/boardgame/${this.props.thing_id}/`;
    let gameName;
    let img_src;
    let yearpublished;
    let minplayers;
    let maxplayers;
    let playingtime;
    let minplaytime;
    let maxplaytime;
    let boardgamecategory;
    let boardgamemechanic;
    let usersrated;
    let average;
    let stddev;
    let averageweight;
    let numplayers;
    let numvotes;
    let bestnplayers;
    if (typeof doc !== "undefined") {
      gameName = doc.getElementsByTagName("name")[0].getAttribute("value");
      img_src = doc.getElementsByTagName("image")[0].childNodes[0].nodeValue;
      yearpublished = doc.getElementsByTagName("yearpublished")[0].attributes
        .value.nodeValue;
      minplayers = doc.getElementsByTagName("minplayers")[0].attributes.value
        .nodeValue;
      maxplayers = doc.getElementsByTagName("maxplayers")[0].attributes.value
        .nodeValue;
      playingtime = doc.getElementsByTagName("playingtime")[0].attributes.value
        .nodeValue;
      minplaytime = doc.getElementsByTagName("minplaytime")[0].attributes.value
        .nodeValue;
      maxplaytime = doc.getElementsByTagName("maxplaytime")[0].attributes.value
        .nodeValue;
      // Link with game characteristics
      // Example: <link type="boardgamecategory" id="1026" value="Negotiation"/>
      boardgamecategory = extractValueFromElement(
        doc,
        "link",
        "type",
        "boardgamecategory",
        "value"
      ).join(", ");
      // Example: <link type="boardgamemechanic" id="2072" value="Dice Rolling"/>
      boardgamemechanic = extractValueFromElement(
        doc,
        "link",
        "type",
        "boardgamemechanic",
        "value"
      ).join(", ");
      // Polls
      // Extract two arrays with this information
      // <results numplayers="3">
      //   <result value="Best" numvotes="421"/> ..
      numplayers = extractValueFromElement(
        doc,
        "results",
        "value",
        "",
        "numplayers"
      );
      numvotes = extractValueFromElement(
        doc,
        "result",
        "value",
        "Best",
        "numvotes"
      );
      bestnplayers = numplayers[this.indexOfMax(numvotes)];
      // Stats
      //let stats = doc.getElementsByTagName("statistics")[0].attributes.value;
      usersrated = doc.getElementsByTagName("usersrated")[0].attributes.value
        .nodeValue;
      average = doc.getElementsByTagName("average")[0].attributes.value
        .nodeValue;
      stddev = doc.getElementsByTagName("stddev")[0].attributes.value.nodeValue;
      averageweight = doc.getElementsByTagName("averageweight")[0].attributes
        .value.nodeValue;
    }
    //console.log("doc:", doc);
    return (
      <div>
        {doc === "undefined" && <div className="spinner" />}
        {typeof doc !== "undefined" && (
          <div>
            <h3>
              {gameName}{" "}
              <a href={url} target="_blank" rel="noopener noreferrer">
                Link
              </a>
            </h3>
            <img
              id="thingImg"
              src={img_src}
              alt="img"
              style={{ maxHeight: "300px" }}
            />
            <br />
            <br />
            <p>{"Year published: " + yearpublished}</p>
            <p>
              {"Players: " +
                minplayers +
                "-" +
                maxplayers +
                " - Best " +
                bestnplayers}
            </p>
            <p title={"Rated by " + usersrated + " users"}>
              {"Rating: " +
                parseFloat(average).toFixed(1) +
                "\u00B1" +
                parseFloat(stddev).toFixed(1)}
            </p>
            <p>{"Weight: " + parseFloat(averageweight).toFixed(1)}</p>
            <p>
              {" Playing time: " +
                playingtime +
                " (" +
                minplaytime +
                "-" +
                maxplaytime +
                ") Min"}
            </p>
            <p>Category: {boardgamecategory}</p>
            <p>Game mechanics: {boardgamemechanic}</p>
            {/*<Container>
              <ListGroup>
                <TransitionGroup className="list">
                  {data.map(({ id, userId, title, body }) => (
                    <CSSTransition key={id} timeout={500} classNames="fade">
                      <ListGroupItem key={id}>
                        {id} {title}
                      </ListGroupItem>
                    </CSSTransition>
                  ))}
                </TransitionGroup>
              </ListGroup>
            </Container>*/}
          </div>
        )}
      </div>
    );
  }
}
