import React from "react";
import io from "socket.io-client";

export const socket = io(process.env.NODE_ENV === "production" ? "http://nameless-island-33777.herokuapp.com" : "http://192.168.1.31:8555", {
  transports: ["websocket"],
});
export const SocketContext = React.createContext(socket);
