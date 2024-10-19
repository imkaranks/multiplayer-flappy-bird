import http from "http";
import { Server, Socket } from "socket.io";
import Game from "../game/game";
import { canvasHeight, canvasWidth } from "../globals";
import { IBird } from "../models/bird";

export class SocketManager {
  private io: Server;
  private games = new Map<string, Game>();

  constructor(
    server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
  ) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
        methods: ["GET", "POST"],
      },
    });

    this.addEventListeners();
  }

  private addEventListeners() {
    this.io.on("connection", (socket) => {
      const username = socket.handshake.query.username as string;
      const globals: {
        roomId: string | null;
      } = { roomId: null };

      this.sendOnlineBirds(socket, globals.roomId);

      socket.emit("set-canvas-size", { canvasWidth, canvasHeight });

      socket.on("create-room", () => {
        const roomId = this.createRoom();
        socket.join(roomId);
        const game = this.games.get(roomId);

        if (game) {
          globals.roomId = roomId;
          socket.join(roomId);
          game.addBird(socket.id, username);
          console.log("joined");
          socket.emit("room-created", roomId);
          this.io.to(roomId).emit("player-joined", socket.id);
        } else {
          socket.emit("room-not-found");
        }
      });

      socket.on("join-room", (roomId: string) => {
        const game = this.games.get(roomId);

        if (game) {
          if (game.didStarted) {
            socket.emit("join-room-failed", {
              message: "Game already started",
            });
            return;
          }

          globals.roomId = roomId;

          socket.join(roomId);
          game.addBird(socket.id, username);

          socket.emit("join-room-success", roomId);
          this.io.to(roomId).emit("player-joined", socket.id, username);
        } else {
          socket.emit("room-not-found");
        }
      });

      socket.on("start-game", (roomId: string) => {
        const game = this.games.get(roomId);

        if (game) {
          if (game.didStarted) {
            socket.emit("start-game-failed", {
              message: "Game already started",
            });
            return;
          }

          game.start(this.io, roomId);
          this.io.to(roomId).emit("game-started", socket.id);
        } else {
          socket.emit("room-not-found");
        }

        this.sendOnlineBirds(socket, roomId);
      });

      socket.on("flap", () => {
        const rooms = Array.from(socket.rooms);
        const roomId = rooms[1];
        const game = this.games.get(roomId);

        if (game) {
          game.flapBird(socket.id);
        }
      });

      socket.on("disconnect", () => {
        const rooms = Array.from(socket.rooms);
        const roomId = rooms.length > 1 ? rooms[1] : globals.roomId;

        if (!roomId) {
          console.log("No room ID found for socket:", socket.id);
          return; // Exit if no valid room ID
        }

        const game = this.games.get(roomId);
        console.log(`Player ${socket.id} disconnected from room ${roomId}`);

        if (game) {
          console.log(
            `Current player count before removal: ${game.playerCount}`
          );
          game.removeBird(socket.id); // Ensure this updates playerCount correctly
          console.log(
            `Current player count after removal: ${game.playerCount}`
          );

          socket.leave(roomId); // Explicitly leave the room

          if (game.playerCount === 0) {
            console.log("Stopping game, no players left");
            game.stop(); // Ensure this method cleans up properly
            this.games.delete(roomId);
            console.log(`Game for room ${roomId} deleted`);
          } else {
            this.io.to(roomId).emit("player-disconnected", socket.id);
          }
        } else {
          console.log("Game not found for room ID:", roomId);
        }

        this.sendOnlineBirds(socket, roomId);
      });
    });
  }

  private createRoom(): string {
    const roomId = `room-${Math.random().toString(36).substring(2, 9)}`;
    this.games.set(roomId, new Game());

    return roomId;
  }

  private sendOnlineBirds(socket: Socket, roomId: string | null) {
    if (roomId) {
      const game = this.games.get(roomId);

      if (game) {
        this.io.emit("online-players", game.getAllBirds());
      }
    }
  }
}
