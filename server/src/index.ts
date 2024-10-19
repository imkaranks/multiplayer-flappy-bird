import "dotenv/config";
import express from "express";
import http from "http";
import { SocketManager } from "./socket/socket";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

new SocketManager(server);

server.listen(PORT, () => {
  console.log("Server is live at port: %d", PORT);
});
