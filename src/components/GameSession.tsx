import { useParams } from "react-router";
import { nanoid } from "nanoid";
import React, { useEffect, useRef, useState } from "react";
import { Box } from "@fower/react";
import { useInterval } from "../hooks/useInterval";
import io from "socket.io-client";
import internal from "stream";

const socket = io("http://localhost:8000");

interface Game {
  words: string[];
  redIndexes: number[];
  blueIndexes: number[];
  neutralIndexes: number[];
  assassinIndex: number;
}

function GameSession() {
  const { sessionID } = useParams<{ sessionID: string }>();
  const [gameID, setGameID] = useState("");
  const [selected, setSelected] = useState(false);
  const [gameState, setGameState] = useState<Game | null>(null);

  useEffect(() => {
    // socket.on("game_state", (gameState: Game) => {
    //   console.log("Got game state: ", gameState);
    // });
    socket.on("game_state", (gameState: Game) => {
      console.log("Got game state: ", gameState);
      setGameState(gameState);
    });
    // socket.on("change-button", ({ buttonSelected }: { buttonSelected: boolean }) => {
    //   setSelected(buttonSelected);
    // });
  }, []);

  let nums = Array.from(Array(25).keys());
  return (
    <Box bg="#282c34" minH="100vh">
      <Box pt-50 text4XL white textCenter w="100%">
        Session {sessionID}: {gameID}
      </Box>
      <Box flex flexWrap="wrap" w="1060px" ml="auto" mr="auto" mt-50>
        {nums.map((i) => {
          return (
            <Box
              m="12px"
              w="188px"
              h="122px"
              bg="#d3d3d3"
              black
              flex
              justifyContent="center"
              alignItems="center"
              text={28}
              onClick={() => {
                console.log("clicked");
                socket.emit("msg", "button was clicked (emit)!");
                // socket.send("button-click", "button was clicked (send)!");
              }}
            >
              SPACE-{i}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default GameSession;
