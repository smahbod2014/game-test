const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/static/index.html");
});

io.on("connection", (socket) => {
  const id = socket.id;
  console.log("a user connected: ", id);

  socket.on("disconnect", () => {
    console.log("user disconnected: ", id);
  });

  socket.on("msg", (message) => {
    console.log(id, " sent: ", message);
  });
});

server.listen(8000, () => {
  console.log("listening on *:8000");
});
