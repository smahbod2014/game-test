import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { nanoid } from "nanoid";
import GameSession from "./components/GameSession";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import { Box } from "@fower/react";
import { styled } from "@fower/styled";
import Login from "./components/Login";
import Home from "./components/Home";
import AuthRoute from "./components/AuthRoute";

function App() {
  // const [id, idSet] = useState<string | null>(null);

  return (
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
        <Route path="/:gameID">
          <div>
            <GameSession />
          </div>
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
