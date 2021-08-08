import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { nanoid } from "nanoid";
import Codenames from "./components/Codenames";
import { BrowserRouter, HashRouter, Link, Route, Switch } from "react-router-dom";
import { Box } from "@fower/react";
import { styled } from "@fower/styled";
import Login from "./components/Login";
import Home from "./components/Home";
import AuthRoute from "./components/AuthRoute";
import { socket, SocketContext } from "./context/socket";
import Decrypto from "./components/Decrypto";

function App() {
  // const [id, idSet] = useState<string | null>(null);

  return (
    <SocketContext.Provider value={socket}>
      <BrowserRouter>
        <Switch>
          <Route path="/" exact>
            <div>
              {/* <AuthRoute> */}
              <Home />
              {/* </AuthRoute> */}
            </div>
          </Route>
          <Route path="/login">
            <div className="App-header">
              <Login />
            </div>
          </Route>
          <Route path="/game/:gameID">
            <div>
              <Codenames />
            </div>
          </Route>
          <Route path="/decrypto/:gameID">
            <div>
              <Decrypto />
            </div>
          </Route>
        </Switch>
      </BrowserRouter>
    </SocketContext.Provider>
  );
}

export default App;
