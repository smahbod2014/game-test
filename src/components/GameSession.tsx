import { useParams } from "react-router";
import { nanoid } from "nanoid";
import React, { useEffect, useRef, useState } from "react";
import { Box } from "@fower/react";
import { useInterval } from "../hooks/useInterval";
import io from "socket.io-client";

const socket = io("http://localhost:8555");

interface Game {
  Words: string[];
  RedIndexes: number[];
  BlueIndexes: number[];
  NeutralIndexes: number[];
  AssassinIndex: number;
  RevealedIndexes: number[];
}

function GameSession() {
  const { sessionID } = useParams<{ sessionID: string }>();
  const [gameID, setGameID] = useState("");
  const [selected, setSelected] = useState(false);
  const [gameState, setGameState] = useState<Game | null>(null);

  useEffect(() => {
    socket.on("game_state", (game: string) => {
      const g: Game = JSON.parse(game);
      setGameState(g);
    });
  }, []);

  let nums = Array.from(Array(25).keys());
  return (
    <Box bg="#282c34" minH="100vh">
      <Box pt-50 text4XL white textCenter w="100%">
        Session {sessionID}: {gameID}
      </Box>
      {gameState && (
      <Box flex flexWrap="wrap" w="1060px" ml="auto" mr="auto" mt-50>
        {gameState.Words.map((word, index) => {
          let bgColor = "#d3d3d3";
          if (gameState.RevealedIndexes.includes(index)) {
            if (gameState.RedIndexes.includes(index)) {
              bgColor = "red"
            } else if (gameState.BlueIndexes.includes(index)) {
              bgColor = "blue"
            } else if (gameState.NeutralIndexes.includes(index)) {
              bgColor = "#e6d2ac"
            } else {
              bgColor = "#1c1c1c"
            }
          }
          return (
            <Box
              key={index}
              m="12px"
              w="188px"
              h="122px"
              bg={bgColor}
              black
              flex
              justifyContent="center"
              alignItems="center"
              text={28}
              onClick={() => {
                console.log("clicked ", index);
                socket.emit("selection", String(index));
                // socket.send("button-click", "button was clicked (send)!");
              }}
            >
              {word}
            </Box>
          );
        })}
      </Box>  
      )}
      
    </Box>
  );
}

export default GameSession;
