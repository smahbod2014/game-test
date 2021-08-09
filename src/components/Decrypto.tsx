import { Box } from "@fower/react";
import React from "react";
import { ChangeEventHandler, useContext, useEffect, useState } from "react";
import { Input } from "reactstrap";
import { classicNameResolver } from "typescript";
import { SocketContext } from "../context/socket";
import whiteSheet from "../images/white_sheet.png";
import classNames from "classnames";
import shuffle from "shuffle-array";
import { useParams } from "react-router";

interface DecryptoState {
  Content: Map<string, string>;
  WhiteWords: string[];
  BlackWords: string[];
  WhiteMiscommunications: number;
  BlackMiscommunications: number;
  WhiteInterceptions: number;
  BlackInterceptions: number;
  WhiteTeamName: string;
  BlackTeamName: string;
}

interface DecryptoWithFlags {
  State: DecryptoState;
  Reset: boolean;
}

function DecryptoSheet({
  color,
  inputChangeHandler,
}: {
  color: string;
  inputChangeHandler: (e: React.FormEvent<HTMLInputElement> | React.FormEvent<HTMLTextAreaElement>) => void;
}) {
  let count = 0;
  return (
    <div className={classNames("decrypto-sheet", "decrypto-" + color, "debug-border")}>
      <div className="decrypto-round-container debug-border">
        {[...Array(8)].map((e, i) => {
          return (
            <div key={"round-entry-" + color + "-" + count} className="decrypto-round-entry debug-border">
              {[...Array(3)].map((e, j) => {
                return (
                  <div key={"round-line-" + color + "-" + count} className="decrypto-round-line debug-border">
                    <input id={"input-" + color + "-" + count} type="text" className="decrypto-input debug-border" onChange={inputChangeHandler} />
                    <input id={"guess-" + color + "-" + count} type="text" className="decrypto-guess debug-border" onChange={inputChangeHandler} />
                    <input id={"correct-" + color + "-" + count++} type="text" className="decrypto-guess debug-border" onChange={inputChangeHandler} />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div className="decrypto-answer-container debug-border">
        <textarea id={"answer-" + color + "-0"} className="decrypto-answer-input debug-border" onChange={inputChangeHandler} />
        <textarea id={"answer-" + color + "-1"} className="decrypto-answer-input debug-border" onChange={inputChangeHandler} />
        <textarea id={"answer-" + color + "-2"} className="decrypto-answer-input debug-border" onChange={inputChangeHandler} />
        <textarea id={"answer-" + color + "-3"} className="decrypto-answer-input debug-border" onChange={inputChangeHandler} />
      </div>
    </div>
  );
}

function Decrypto() {
  const socket = useContext(SocketContext);
  let { gameID } = useParams<{ gameID: string }>();
  const [code, setCode] = useState(localStorage.getItem("decrypto_code"));
  const [whiteMiscommunications, setWhiteMiscommunications] = useState(0);
  const [blackMiscommunications, setBlackMiscommunications] = useState(0);
  const [whiteInterceptions, setWhiteInterceptions] = useState(0);
  const [blackInterceptions, setBlackInterceptions] = useState(0);
  const [words, setWords] = useState<string[]>([]);

  gameID = gameID === undefined || gameID === "" ? "default" : gameID;

  const updateScores = (decryptoState: DecryptoState) => {
    setWhiteMiscommunications(decryptoState.WhiteMiscommunications);
    setWhiteInterceptions(decryptoState.WhiteInterceptions);
    setBlackMiscommunications(decryptoState.BlackMiscommunications);
    setBlackInterceptions(decryptoState.BlackInterceptions);
  };

  const updateInputs = (decryptoState: DecryptoState) => {
    for (let [id, value] of new Map(Object.entries(decryptoState.Content))) {
      const element: HTMLElement = document.getElementById(id)!;
      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        element.value = value;
      }
    }
  };

  useEffect(() => {
    socket.on("game_state", (msg: string) => {
      const decrypto: DecryptoWithFlags = JSON.parse(msg);
      updateScores(decrypto.State);
      updateInputs(decrypto.State);
      setWords(decrypto.State.WhiteWords);

      if (decrypto.Reset) {
        setCode("");
      }
    });

    socket.on("text_event", (msg: string) => {
      const decryptoState: DecryptoState = JSON.parse(msg);
      updateInputs(decryptoState);
    });

    socket.on("score_event", (msg: string) => {
      const decryptoState: DecryptoState = JSON.parse(msg);
      updateScores(decryptoState);
    });

    socket.emit("join_decrypto", gameID);
  }, []);

  useEffect(() => {
    localStorage.setItem("decrypto_code", code ?? "");
  }, [code]);

  const inputChangeHandler = (e: React.FormEvent<HTMLInputElement> | React.FormEvent<HTMLTextAreaElement>) => {
    socket.emit("decrypto_text", JSON.stringify({ ElementID: e.currentTarget.id, Value: e.currentTarget.value, GameID: gameID }));
  };

  const scoreHandler = (color: string, change: number, variable: string) => {
    socket.emit("decrypto_score", JSON.stringify({ Color: color, Change: change, Variable: variable, GameID: gameID }));
  };

  return (
    <Box bg="#282c34" minH="100vh" w="100%">
      <Box w="50%" flex justifyContent="space-evenly" ml="auto" mr="auto" pt-50 text="2vw" white textCenter>
        {words.map((word, index) => {
          return (
            <Box>
              {index + 1}: {word}
            </Box>
          );
        })}
      </Box>

      <Box flex justifyContent="center" mt10 w="75vw" ml="auto" mr="auto">
        <DecryptoSheet color="white" inputChangeHandler={inputChangeHandler} />
        <Box flex flexDirection="column">
          <Box
            as="button"
            h="50px"
            bgGray400
            bgGray400--D10--hover
            white
            rounded
            py3
            px5
            outlineNone
            cursorPointer
            onClick={() => {
              setCode(shuffle([1, 2, 3, 4]).slice(0, 3).join(" "));
            }}
          >
            Generate Code
          </Box>
          <Box white text4XL textCenter h="50px">
            {code}
          </Box>
          <Box white text3XL textCenter mt10>
            Miscommunications
            <Box flex flexDirection="row" justifyContent="space-evenly" h="100px">
              <Box flex w="110px" justifyContent="space-between" alignItems="center">
                <Box text7XL flex alignItems="center" justifyContent="center">
                  {whiteMiscommunications}
                </Box>
                <div className="buttons">
                  <button className="plus" onClick={() => scoreHandler("white", 1, "miscommunication")}>
                    +
                  </button>
                  <button className="minus" onClick={() => scoreHandler("white", -1, "miscommunication")}>
                    -
                  </button>
                </div>
              </Box>
              <Box w="50%" />
              <Box flex w="110px" justifyContent="space-between" alignItems="center">
                <div className="buttons">
                  <button className="plus" onClick={() => scoreHandler("black", 1, "miscommunication")}>
                    +
                  </button>
                  <button className="minus" onClick={() => scoreHandler("white", -1, "miscommunication")}>
                    -
                  </button>
                </div>
                <Box text7XL flex alignItems="center" justifyContent="center">
                  {blackMiscommunications}
                </Box>
              </Box>
            </Box>
          </Box>
          <Box white text3XL textCenter mt10>
            Interceptions
            <Box flex flexDirection="row" justifyContent="space-evenly" h="100px">
              <Box flex w="110px" justifyContent="space-between" alignItems="center">
                <Box text7XL flex alignItems="center" justifyContent="center">
                  {whiteInterceptions}
                </Box>
                <div className="buttons">
                  <button className="plus" onClick={() => scoreHandler("white", 1, "interception")}>
                    +
                  </button>
                  <button className="minus" onClick={() => scoreHandler("white", -1, "interception")}>
                    -
                  </button>
                </div>
              </Box>
              <Box w="50%" />
              <Box flex w="110px" justifyContent="space-between" alignItems="center">
                <div className="buttons">
                  <button className="plus" onClick={() => scoreHandler("black", 1, "interception")}>
                    +
                  </button>
                  <button className="minus" onClick={() => scoreHandler("black", -1, "interception")}>
                    -
                  </button>
                </div>
                <Box text7XL flex alignItems="center" justifyContent="center">
                  {blackInterceptions}
                </Box>
              </Box>
            </Box>
          </Box>
          <Box
            as="button"
            h="50px"
            m="auto"
            bgGray400
            bgGray400--D10--hover
            white
            rounded
            py3
            px5
            mt20
            outlineNone
            cursorPointer
            onClick={() => {
              socket.emit("decrypto_new_game", gameID);
            }}
          >
            New Game
          </Box>
        </Box>
        <DecryptoSheet color="black" inputChangeHandler={inputChangeHandler} />
      </Box>
      {/* <div className="flip-card">
        <div className="flip-card-inner">
          <div className="flip-card-front">
            <DecryptoSheet color="white" inputChangeHandler={inputChangeHandler} />
          </div>

          <div className="flip-card-back">
            <DecryptoSheet color="black" inputChangeHandler={inputChangeHandler} />
          </div>
        </div>
      </div> */}
    </Box>
  );
}

export default Decrypto;
