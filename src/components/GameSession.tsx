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
  WhoseTurn: string;
  StartingTeam: string;
  GameOver: boolean;
}

interface GameFlags {
  GameState: Game;
  Reset: boolean;
}

function GetRedRemaining(game: Game): number {
  return (
    game.RedIndexes.length -
    game.RedIndexes.filter((value) => game.RevealedIndexes.includes(value))
      .length
  );
}

function GetBlueRemaining(game: Game): number {
  return (
    game.BlueIndexes.length -
    game.BlueIndexes.filter((value) => game.RevealedIndexes.includes(value))
      .length
  );
}

function IsAlreadyRevealed(game: Game, index: number): boolean {
  return game.RevealedIndexes.includes(index);
}

function GameSession() {
  let { gameID } = useParams<{ gameID: string }>();
  const [gameState, setGameState] = useState<Game | null>(null);
  const [isSpymaster, setIsSpymaster] = useState(
    localStorage.getItem("codenames_is_spymaster") === "true"
  );

  gameID = gameID === undefined || gameID === "" ? "default" : gameID;

  useEffect(() => {
    socket.on("game_state", (game: string) => {
      const g: GameFlags = JSON.parse(game);
      setGameState(g.GameState);

      if (g.Reset) {
        localStorage.removeItem("codenames_is_spymaster");
        setIsSpymaster(false);
      }
    });

    socket.emit("join", gameID);
  }, [gameID]);

  if (!gameState) {
    return (
      <Box bg="#282c34" minH="100vh">
        <Box pt-50 text4XL white textCenter w="100%">
          Loading...
        </Box>
      </Box>
    );
  }

  return (
    <Box bg="#282c34" minH="100vh">
      <Box pt-50 text4XL white textCenter w="100%">
        CODENAMES
      </Box>
      <Box w="1000px" ml="auto" mr="auto">
        <Box mt-30 flex justifyContent="space-between">
          <Box white text3XL>
            <Box inline color={gameState.StartingTeam}>
              {gameState.StartingTeam === "red"
                ? GetRedRemaining(gameState)
                : GetBlueRemaining(gameState)}
            </Box>
            <Box inline>&#160;-&#160;</Box>
            <Box
              inline
              color={gameState.StartingTeam === "red" ? "blue" : "red"}
            >
              {gameState.StartingTeam === "red"
                ? GetBlueRemaining(gameState)
                : GetRedRemaining(gameState)}
            </Box>
          </Box>
          <Box text2XL color={gameState.WhoseTurn}>
            {gameState.WhoseTurn === "red" ? "Red" : "Blue"}
            {gameState.GameOver ? " wins!" : "'s turn"}
          </Box>
          <Box>
            <Box
              as="button"
              bgGray400
              bgGray400--D10--hover
              white
              rounded
              py3
              px5
              outlineNone
              cursorPointer
              disabled={gameState.GameOver}
              onClick={() => {
                socket.emit("pass", gameID);
              }}
            >
              Pass
            </Box>
          </Box>
        </Box>

        <Box
          flex
          flexWrap="wrap"
          h="670px"
          mt-20
          justifyContent="space-between"
        >
          {gameState.Words.map((word, index) => {
            let textColor = "black";
            let bgColor = "#d3d3d3";
            if (isSpymaster) {
              if (gameState.RedIndexes.includes(index)) {
                textColor = "red";
              } else if (gameState.BlueIndexes.includes(index)) {
                textColor = "blue";
              } else if (gameState.AssassinIndex == index) {
                bgColor = "gray";
              }
            }

            if (gameState.RevealedIndexes.includes(index)) {
              textColor = "white";
              if (gameState.RedIndexes.includes(index)) {
                bgColor = "red";
              } else if (gameState.BlueIndexes.includes(index)) {
                bgColor = "blue";
              } else if (gameState.NeutralIndexes.includes(index)) {
                bgColor = "#e6d2ac";
                textColor = "black";
              } else {
                bgColor = "#1c1c1c";
              }
            } else if (gameState.GameOver && !isSpymaster) {
              if (gameState.RedIndexes.includes(index)) {
                bgColor = "#ff9696";
              } else if (gameState.BlueIndexes.includes(index)) {
                bgColor = "#9696ff";
              } else if (index == gameState.AssassinIndex) {
                bgColor = "#1c1c1c";
              }
            }

            return (
              <Box
                key={index}
                // m="12px"
                w="188px"
                h="122px"
                bg={bgColor}
                color={textColor}
                flex
                justifyContent="center"
                alignItems="center"
                text={22}
                borderStyle="solid"
                border={isSpymaster && gameState.AssassinIndex == index && 7}
                borderBlack={gameState.AssassinIndex == index}
                cursorPointer={
                  !isSpymaster &&
                  !gameState.GameOver &&
                  !IsAlreadyRevealed(gameState, index)
                }
                onClick={() => {
                  if (isSpymaster || gameState.GameOver) {
                    return;
                  }
                  socket.emit(
                    "selection",
                    JSON.stringify({ Index: index, GameID: gameID })
                  );
                }}
              >
                {word}
              </Box>
            );
          })}
        </Box>
        <Box
          flex
          justifyContent="flex-end"
          mt="10px"
          color="white"
          alignItems="center"
        >
          <div className="form-check form-switch">
            <input
              className="form-check-input hoverable"
              type="checkbox"
              id="flexSwitchCheckChecked"
              checked={isSpymaster}
              onChange={(e) => {
                setIsSpymaster(e.target.checked);
                localStorage.setItem(
                  "codenames_is_spymaster",
                  String(e.target.checked)
                );
              }}
            />
            <label
              className="form-check-label hoverable"
              htmlFor="flexSwitchCheckChecked"
            >
              Spymaster
            </label>
          </div>
          <Box
            as="button"
            ml10
            bgGray400
            bgGray400--D10--hover
            white
            rounded
            py3
            px5
            outlineNone
            cursorPointer
            onClick={() => {
              socket.emit("new_game", gameID);
            }}
          >
            New Game
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default GameSession;
