import { io } from "socket.io-client";
import Base from "./game/base";
import Bird from "./game/bird";
import Obstacle from "./game/obstacle";
import "./style.css";

(function () {
  const profanityBaseURL =
    "https://www.purgomalum.com/service/containsprofanity?text=";
  let username: string | null = localStorage.getItem("flappy_bird_username");
  let roomName: string;
  let base: Base | null = null;
  const birds = new Map<string, Bird>();
  const obstaclePool: Obstacle[] = [];

  // Get elements from the DOM
  const createRoomButton = document.getElementById(
    "create-room"
  ) as HTMLButtonElement;
  const joinRoomButton = document.getElementById(
    "join-room"
  ) as HTMLButtonElement;
  const startGameButton = document.getElementById(
    "start-game"
  ) as HTMLButtonElement;

  // const roomNameInput = document.getElementById(
  //   "room-name"
  // ) as HTMLInputElement;
  const joinRoomNameInput = document.getElementById(
    "join-room-name"
  ) as HTMLInputElement;

  const currentRoomDisplay = document.getElementById(
    "current-room"
  ) as HTMLSpanElement;
  const roomSetupDiv = document.getElementById("room-setup") as HTMLDivElement;
  const gameStartDiv = document.getElementById("game-start") as HTMLDivElement;
  const gameCanvas = document.getElementById(
    "game-canvas"
  ) as HTMLCanvasElement;
  const ctx = gameCanvas.getContext("2d");

  // Images
  const backgroundImage = new Image();
  backgroundImage.src = "/background-day.png";
  const baseImage = new Image();
  baseImage.src = "/base.png";

  async function getUsername() {
    while (!username && !username?.trim()) {
      const incomingUsername = prompt("Please enter a username:")?.trim();

      if (incomingUsername) {
        await fetch(
          profanityBaseURL +
            encodeURIComponent(incomingUsername) +
            "&fill_text=***"
        )
          .then((raw) => raw.text())
          .then((res) => {
            if (res === "false") {
              username = incomingUsername;
              localStorage.setItem("flappy_bird_username", incomingUsername);
            } else {
              throw new Error("Please refrain from using profane username");
            }
          })
          .catch((err) =>
            alert(err instanceof Error ? err.message : "Some error occured")
          );
      }
    }
  }

  function toggleRoomSetup(show: boolean): void {
    roomSetupDiv.style.display = show ? "block" : "none";
  }

  function toggleGameStart(show: boolean): void {
    gameStartDiv.style.display = show ? "block" : "none";
  }

  // Function to get an obstacle from the pool
  function getObstacleFromPool(
    ctx: CanvasRenderingContext2D,
    obstacleData: Obstacle
  ): Obstacle {
    let obstacle;
    if (obstaclePool.length > 0) {
      obstacle = obstaclePool.pop()!;
      // Update properties
      obstacle.x = obstacleData.x;
      obstacle.y = obstacleData.y;
      obstacle.width = obstacleData.width;
      obstacle.height = obstacleData.height;
      obstacle.top = obstacleData.top;
    } else {
      obstacle = new Obstacle(
        ctx,
        obstacleData.x,
        obstacleData.y,
        obstacleData.width,
        obstacleData.height,
        obstacleData.top
      );
    }
    return obstacle;
  }

  window.onload = async () => {
    try {
      await getUsername();

      const socket = io(import.meta.env.VITE_API_URL, {
        query: {
          username,
        },
      });

      createRoomButton.addEventListener("click", createRoom);
      joinRoomButton.addEventListener("click", joinRoom);
      startGameButton.addEventListener("click", startGame);

      function createRoom(): void {
        socket.emit("create-room");
      }

      socket.on("room-created", (roomId: string) => {
        roomName = roomId;
        currentRoomDisplay.textContent = roomName;
        toggleRoomSetup(false);
        toggleGameStart(true);
      });

      function joinRoom(): void {
        roomName = joinRoomNameInput.value;
        if (roomName) {
          socket.emit("join-room", roomName);
        }
      }

      socket.on("join-room-success", (roomName: string) => {
        currentRoomDisplay.textContent = roomName;
        toggleRoomSetup(false);
        toggleGameStart(true);
      });

      socket.on("join-room-failed", (payload: { message: string }) => {
        alert(payload.message);

        currentRoomDisplay.textContent = "";
        toggleRoomSetup(true);
        toggleGameStart(false);
      });

      socket.on("player-joined", (socketId: string) => {
        // if (socket.id !== socketId) return;
        const isMe = socket.id === socketId;

        const newBird = new Bird(ctx, socketId, 0, 0, 0, 2, 24, isMe);

        birds.set(socketId, newBird);

        currentRoomDisplay.textContent = roomName;
        toggleRoomSetup(false);
        toggleGameStart(true);
      });

      socket.on("bird-collision", (socketId: string) => {
        birds.delete(socketId);
      });

      function startGame(): void {
        socket.emit("start-game", roomName);
      }

      socket.on("start-game-failed", (payload: { message: string }) => {
        alert(payload.message);
      });

      socket.on("game-started", () => {
        // gameStarted = true;
        toggleGameStart(false);
        renderCanvas();
      });

      function drawBackground(
        canvasWidth: number,
        canvasHeight: number,
        ctx: CanvasRenderingContext2D,
        backgroundImage: HTMLImageElement
      ): void {
        const repeat = Math.ceil(canvasWidth / backgroundImage.width);

        for (let i = 0; i < repeat; ++i) {
          ctx.drawImage(
            backgroundImage,
            0,
            0,
            backgroundImage.width,
            backgroundImage.height,
            i * backgroundImage.width,
            canvasHeight - backgroundImage.height,
            backgroundImage.width,
            backgroundImage.height
          );
        }
      }

      function renderCanvas(): void {
        gameCanvas.classList.remove("hidden");

        if (ctx) {
          gameCanvas.width = 560;
          gameCanvas.height = 400;

          drawBackground(
            gameCanvas.width,
            gameCanvas.height,
            ctx,
            backgroundImage
          );

          birds.forEach((bird) => {
            if (bird.id === socket.id) return;

            bird.draw();
          });

          birds.get(socket.id!)!.draw();

          base = new Base(ctx, baseImage, gameCanvas);
        }
      }

      socket.on("game-state", (state) => {
        if (!ctx) return;

        // console.log(state);

        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

        drawBackground(
          gameCanvas.width,
          gameCanvas.height,
          ctx,
          backgroundImage
        );

        const { birds: aliveBirds, obstacles } = state as {
          birds: Bird[];
          obstacles: Obstacle[];
        };

        let myBirdState: Bird | null = null;

        for (const bird of aliveBirds) {
          const existingBird = birds.get(bird.id);

          if (existingBird && existingBird.id === socket.id) {
            myBirdState = bird;
          } else {
            if (!existingBird) {
              const newBird = new Bird(
                ctx,
                bird.id,
                bird.x,
                bird.y,
                bird.dx,
                bird.dy,
                bird.height,
                false
              );
              birds.set(bird.id, newBird);
            } else {
              existingBird.update(bird.x, bird.y);
            }
          }
        }

        const myBird = birds.get(socket.id!);

        if (myBirdState && myBird) {
          myBird.update(myBirdState.x, myBirdState.y);
        }

        obstacles.forEach((obstacleData) => {
          const obstacle = getObstacleFromPool(ctx, obstacleData);
          obstacle.draw();

          // If the obstacle is off-screen, return it to the pool
          if (obstacle.x + obstacle.width < 0) {
            // Assuming off-screen when it's fully out of view
            obstacle.returnToPool(obstaclePool);
          }
        });

        if (base !== null) {
          base.update();
        }
      });

      document.onclick = () => {
        socket.emit("flap", socket.id);
      };

      document.onkeydown = ({ key }) => {
        switch (key.toLowerCase()) {
          case " ":
          case "arrowup":
          case "w":
          case "enter":
            socket.emit("flap", socket.id);
            break;
          default:
            return;
        }
      };
    } catch (error) {
      console.log(
        error instanceof Error ? error.message : "Some error Occured"
      );
    }
  };
})();
