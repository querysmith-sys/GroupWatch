import express from "express";
import cors from "cors"
import roomRouter from "./api/room"
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { eventHandler } from "./socket/handlers";
const app = express();
app.use(cors({
  origin: "http://localhost:3000"
}))
const httpServer = createServer(app);
const io = new Server(httpServer, {
   cors:{
    origin: "http://localhost:3000"
   }
});

io.on("connection", (socket: Socket) => {
  console.log("a user connected");
  eventHandler(socket, io);
});

app.use(express.json());

app.use("/api", roomRouter)
httpServer.listen(4000);