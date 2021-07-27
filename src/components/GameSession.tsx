import { useParams } from "react-router";
import { nanoid } from "nanoid";
import React, { useEffect, useRef, useState } from "react";
import { Box } from "@fower/react";
import { useInterval } from "../hooks/useInterval";
import io from "socket.io-client";

const socket = io("http://localhost:8000");

function GameSession() {
  const { sessionID } = useParams<{ sessionID: string }>();
  const [gameID, setGameID] = useState("");
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    console.log("sent message i just joined");
    socket.emit("msg", "i just joined");
    // socket.on("change-button", ({ buttonSelected }: { buttonSelected: boolean }) => {
    //   setSelected(buttonSelected);
    // });
  }, []);

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
        bg={selected ? "#0f0" : "#00f"}
        white
        textCenter
        pt="30"
        onClick={() => {
          console.log("clicked");
          socket.emit("msg", "button was clicked (emit)!");
          // socket.send("button-click", "button was clicked (send)!");
        }}
      >
        Test
      </Box>
    </>
  );
}

export default GameSession;
