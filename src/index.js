import React from "react";
import ReactDOM from "react-dom";
import io from "socket.io-client";
import moment from "moment";
import {
  MapContainer,
  Marker,
  TileLayer,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./map.css";
import { IconLocation } from "./IconLocation";
import { Icon, map } from "leaflet";

const user = prompt("ingresar usuario");

class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
    };
  }
  componentDidMount() {
    this.socket = io("wss://tarea-3-websocket.2021-1.tallerdeintegracion.cl/", {
      path: "/flights",
      transports: ["websocket"],
    });
    this.socket.on("CHAT", (message) => {
      this.setState({ messages: [message, ...this.state.messages] });
    });
  }

  handleSubmit = (event) => {
    const texto = event.target.value;
    if (event.keyCode === 13 && texto) {
      const message = {
        name: user,
        message: texto,
      };
      //   ok this.setState({ messages: [message, ...this.state.messages] });
      this.socket.emit("CHAT", message);
      event.target.value = "";
    }
  };

  render() {
    const messages = this.state.messages.map((message, index) => {
      return (
        <li key={index}>
          <b>
            {moment(new Date(parseInt(message.date))).format(
              "DD MM YYYY hh:mm:ss"
            )}{" "}
            - {message.name}: {message.message}
          </b>
        </li>
      );
    });
    return (
      <div>
        <input type="text" placeholder="" onKeyUp={this.handleSubmit} />
        {messages}
      </div>
    );
  }
}

class MapRender extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      positions: {},
      flights: [],
    };
  }

  componentDidMount() {
    this.socket = io("wss://tarea-3-websocket.2021-1.tallerdeintegracion.cl/", {
      path: "/flights",
      transports: ["websocket"],
    });
    this.socket.on("POSITION", (position) => {
      const newJson = this.state.positions;
      if (newJson[position.code] == undefined) {
        newJson[position.code] = {};
        newJson[position.code].position = position.position;
      } else {
        if (newJson[position.code].prevPos == undefined) {
          newJson[position.code].prevPos = [];
        } else {
          newJson[position.code].prevPos = [
            ...newJson[position.code].prevPos,
            newJson[position.code].position,
          ];
        }
        newJson[position.code].position = position.position;
      }
      this.setState({ positions: newJson });
      console.log(this.state.positions);
    });

    this.socket.on("FLIGHTS", (flight) => {
      this.setState({ flights: flight });
      console.log(flight);
    });
  }

  handleRequest = (event) => {
    console.log("lo hicimos");
    this.socket.emit("FLIGHTS");
  };

  render() {
    let flights = [];
    let paths = [];
    for (const flight in this.state.positions) {
      flights = [
        <Marker position={this.state.positions[flight].position}>
          <Popup>{flight}</Popup>
        </Marker>,
        ...flights,
      ];
      if (this.state.positions[flight].prevPos !== undefined) {
        paths = [
          <Polyline
            pathOptions={{ color: "red" }}
            positions={this.state.positions[flight].prevPos}
          />,
          ...paths,
        ];
      }
    }
    return (
      <div>
        <button onClick={this.handleRequest}>Pedir informacion</button>
        <MapContainer center={{ lat: "4.6973985", lng: "13.41053" }} zoom={2}>
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {flights}
          {paths}
        </MapContainer>
      </div>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <MapRender />
        <Chat />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
