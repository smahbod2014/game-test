import { useState } from "react";

function GameLobby() {
  const [GameStarted, setGameStarted] = useState(false);

  return (
    <>
      <h1>Game Lobby</h1>
      <p>Waiting for player to join</p>
    </>
  );
}

export default GameLobby;
