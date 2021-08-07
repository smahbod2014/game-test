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
      <h1>Welcome ({process.env.NODE_ENV})</h1>

      {/* <Box>Welcome, {Firebase.auth().currentUser?.uid}</Box> */}

      <Link to={`/game/${nanoid()}`}>
        <Button color="info">New Game</Button>
        {/* <Box
          as="button"
          mt="5"
          text4XL
          border-1
          rounded="5"
          w="100%"
          minW="200"
          onClick={() => setSessonID("")}
        >
          Go
        </Box> */}
      </Link>
    </Box>
  );
};

export default Home;
