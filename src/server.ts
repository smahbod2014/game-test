import { createServer } from "http";
import { Server, Socket } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket: Socket) => {
  console.log("user connected");
  socket.on("disconnect", (reason) => {
    console.log("user disconnected: " + reason);
  });

  socket.on(
    "change-button",
    ({ buttonSelected }: { buttonSelected: boolean }) => {
      console.log("Received change-button event from " + socket.id);
      io.emit("change-button", { buttonSelected });
    }
  );
});

httpServer.listen(4000);
