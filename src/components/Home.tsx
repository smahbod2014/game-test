import { Box } from "@fower/react";
import React, { useState } from "react";
import { Link, Redirect } from "react-router-dom";
import { styled } from "@fower/styled";
import Firebase from "../config/firebase";
import { Button, Spinner } from "reactstrap";
import { nanoid } from "nanoid";

const Home = () => {
  const [sessionID, setSessonID] = useState("");
  const [Loading, setLoading] = useState(false);

  // Firebase.auth().onAuthStateChanged((user) => {
  //   setLoading(false);
  // });

  if (Loading) {
    return <Spinner color="info" children="" />;
  }

  // if (!Firebase.auth().currentUser) {
  //   return <Redirect to="/login" />;
  // }

  return (
    <Box className="App-header">
      <h1>Choose a game</h1>

      {/* <Box>Welcome, {Firebase.auth().currentUser?.uid}</Box> */}

      <Link to={`/game/${nanoid()}`}>
        <Button color="info">Codenames</Button>
      </Link>
      <Link to={`/decrypto/${nanoid()}`}>
        <Button color="info">Decrypto</Button>
      </Link>
    </Box>
  );
};

export default Home;
