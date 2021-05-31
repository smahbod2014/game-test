import { useParams } from "react-router";
import { nanoid } from "nanoid";
import React, { useEffect, useState } from "react";
import { Box } from "@fower/react";
import { useInterval } from "../hooks/useInterval";

interface SessionResponse {
  sessionID: string;
  gameID: string;
  buttonClicked: boolean;
}

function fetchGameState(
  sessionID: string,
  setGameID: React.Dispatch<React.SetStateAction<string>>,
  setClicked: React.Dispatch<React.SetStateAction<boolean>>
) {
  fetch(`http://localhost:8080/${sessionID}`)
    .then((resp) => resp.json())
    .then((sessionInfo: SessionResponse) => {
      setGameID(sessionInfo.gameID);
      setClicked(sessionInfo.buttonClicked);
    });
}

function GameSession() {
  const { sessionID } = useParams<{ sessionID: string }>();
  const [gameID, setGameID] = useState("");
  const [clicked, setClicked] = useState(false);

  fetchGameState(sessionID, setGameID, setClicked);

  useInterval(() => fetchGameState(sessionID, setGameID, setClicked), 3000);

  return (
    <>
      <h1>
        Session {sessionID}: {gameID}
      </h1>
      <Box
        ml10
        maxW="100"
        minH="100"
        w="100%"
        h="100%"
        bg={clicked ? "#00ff00" : "#0000ff"}
        white
        textCenter
        pt="30"
        onClick={() => {
          setClicked(!clicked);

          const options = {
            method: "PUT",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json;charset=UTF-8",
            },
            body: JSON.stringify({
              id: gameID,
              buttonClicked: !clicked,
            }),
          };
          fetch(`http://localhost:8080/${sessionID}`, options).then(
            (response) => console.log(response)
          );
        }}
      >
        Test
      </Box>
    </>
  );
}

export default GameSession;
