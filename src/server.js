"use strict";
exports.__esModule = true;
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var httpServer = http_1.createServer();
var io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*"
    }
});
io.on("connection", function (socket) {
    console.log("user connected");
    socket.on("disconnect", function (reason) {
        console.log("user disconnected: " + reason);
    });
    socket.on("change-button", function (_a) {
        var buttonSelected = _a.buttonSelected;
        console.log("Received change-button event from " + socket.id);
        io.emit("change-button", { buttonSelected: buttonSelected });
    });
});
httpServer.listen(4000);
