import React from "react";
import ReactDOM from "react-dom";
import io from "socket.io-client";
import moment from "moment";

const user = prompt("ingresar usuario");

const element = <h1>Hello world</h1>;

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
      //   this.setState({ messages: [message, ...this.state.messages] });
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

class App extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <div className="algo">{element}</div>;
  }
}

ReactDOM.render(<Chat />, document.getElementById("root"));
