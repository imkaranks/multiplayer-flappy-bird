import { Server } from "socket.io";
import { canvasHeight, canvasWidth } from "../globals";
import Bird, { IBird } from "../models/bird";
import Obstacle, { IObstacle } from "../models/obstacle";

export abstract class GameObject {
  constructor() {}

  update() {}
}

interface GameState {
  birds: IBird[];
  obstacles: IObstacle[];
}

class Game {
  private birds = new Map<string, IBird>();
  private obstacles: IObstacle[] = [];
  private state: GameState = {
    birds: [],
    obstacles: [],
  };
  private interval: NodeJS.Timeout | undefined;
  private obstacleInterval: NodeJS.Timeout | undefined;
  private fps = 60;
  private frameDuration = Math.floor(1000 / this.fps);
  private canvasWidth = 560;
  private canvasHeight = 400;
  private roomId: string | undefined;
  playerCount = 0;
  // roomId: string | undefined;
  didStarted: boolean = false;

  constructor() {
    // super();

    this.getAllBirds = this.getAllBirds.bind(this);
    this.getAliveBirds = this.getAliveBirds.bind(this);
  }

  addBird(id: string, username: string) {
    const width = 34;
    const height = 24;

    const bird = new Bird(
      id,
      this.canvasWidth / 2 - width / 2,
      this.canvasHeight / 2 - height / 2,
      0,
      2,
      0.5,
      width,
      height,
      username
    );

    this.birds.set(id, bird);
    this.playerCount++;
  }

  removeBird(id: string) {
    this.birds.delete(id);
    this.playerCount--;
  }

  flapBird(id: string) {
    const bird = this.birds.get(id);

    if (bird) {
      bird.flap();
    }
  }

  private getAliveBirds() {
    const aliveBirds = new Map<string, IBird>();

    for (const [id, bird] of this.birds) {
      if (bird.alive) {
        aliveBirds.set(id, bird);
      }
    }

    return Array.from(aliveBirds.values());
  }

  getAllBirds() {
    const allBirds = new Map<string, IBird>();

    for (const [id, bird] of this.birds) {
      allBirds.set(id, bird);
    }

    return Array.from(allBirds.values());
  }

  private createObstacles() {
    let count = 0;

    clearInterval(this.obstacleInterval);
    // const gap = 100;
    const gap = 0.3; // Gap between top and bottom pipes

    this.obstacleInterval = setInterval(() => {
      const height = Math.random() * 0.5 + 0.1; // Height between 0.1 and 0.6

      const topPipeHeight = height * canvasHeight; // Scale height by canvasHeight
      const bottomPipeHeight = (1 - height - gap) * canvasHeight; // Scale height by canvasHeight

      const topPipe = new Obstacle(
        count,
        canvasWidth, // Start position (x) for the top pipe
        0, // Start position (y) for the top pipe
        2, // dx
        0, // dy
        50, // Width
        topPipeHeight, // Scaled height
        true // Is top pipe
      );

      const bottomPipe = new Obstacle(
        count,
        canvasWidth, // Start position (x) for the bottom pipe
        topPipeHeight + gap * canvasHeight, // Start position (y) for the bottom pipe
        2, // dx
        0, // dy
        50, // Width
        bottomPipeHeight, // Scaled height
        false // Is bottom pipe
      );

      this.obstacles.push(topPipe, bottomPipe);
      count++;
    }, 2000);
  }

  detectCollisions = (io: Server) => {
    for (const [id, bird] of this.birds.entries()) {
      if (!bird.alive) continue;

      for (const obstacle of this.obstacles) {
        // Collision detected
        if (this.checkCollision(bird, obstacle)) {
          console.log(`Collision detected for bird: ${id}`);

          bird.alive = false;
          io.emit("bird-collision", id); // Notify clients of the collision

          // Emit the game state
          // io.emit("game-state", [this.getAliveBirds(), this.obstacles]);

          if (!this.getAliveBirds().length) {
            this.stop();

            if (this.roomId) {
              io.to(this.roomId).emit("game-over");
            }
          }
          break; // No need to check other obstacles
        }
      }
    }
  };

  checkCollision(bird: IBird, obstacle: IObstacle): boolean {
    // Define bird bounds
    const birdBounds = {
      left: bird.x,
      right: bird.x + bird.width,
      top: bird.y,
      bottom: bird.y + bird.height,
    };

    // Define obstacle bounds
    const obstacleBounds = {
      left: obstacle.x,
      right: obstacle.x + obstacle.width,
      top: obstacle.y,
      bottom: obstacle.y + obstacle.height,
    };

    // Check for collision
    return (
      birdBounds.right > obstacleBounds.left &&
      birdBounds.left < obstacleBounds.right &&
      birdBounds.bottom > obstacleBounds.top &&
      birdBounds.top < obstacleBounds.bottom
    );
  }

  updateScores = () => {
    // Increment scores for birds that successfully passed obstacles
    for (const [id, bird] of this.birds.entries()) {
      if (!bird.alive) continue;

      this.obstacles.forEach((obstacle) => {
        if (
          obstacle.x + obstacle.width < bird.x &&
          !bird.dodgedObstacle.has(obstacle.groupId)
        ) {
          bird.score++; // Increment score
          bird.dodgedObstacle.add(obstacle.groupId); // Mark this obstacle as dodged
        }
      });
    }
  };

  update(io: Server): void {
    // Check for collisions
    this.detectCollisions(io);

    this.updateScores();

    // Update birds
    for (const [id, bird] of this.birds) {
      if (!bird.alive) continue;

      bird.update();
    }

    // Update obstacles
    if (this.obstacles.length) {
      for (const obstacle of this.obstacles) {
        obstacle.update();
      }

      // Remove obstacles that are off-screen
      this.obstacles = this.obstacles.filter((obstacle) => !obstacle.toDelete);
    }

    // check for game over state after updating
    if (!this.getAliveBirds().length) {
      this.stop();

      if (this.roomId) {
        io.to(this.roomId).emit("game-over");
      }
    }
  }

  sendGameState(io: Server, roomId: string): void {
    io.to(roomId).emit("game-state", {
      birds: this.getAliveBirds(),
      obstacles: this.obstacles,
    });
  }

  gameLoop(io: Server, roomId: string): void {
    clearInterval(this.interval);

    this.interval = setInterval(() => {
      this.update(io);
      this.sendGameState(io, roomId);
    }, this.frameDuration);
  }

  start(io: Server, roomId: string): void {
    if (this.didStarted) return;

    this.obstacles = [];
    this.didStarted = true;
    this.roomId = roomId;
    this.gameLoop(io, roomId);
    this.createObstacles();
  }

  stop(): void {
    if (!this.didStarted) return;

    this.didStarted = false;
    clearInterval(this.interval);
    clearInterval(this.obstacleInterval);
  }

  restart(io: Server, roomId: string): void {
    this.stop();

    // Reset game state variables
    this.obstacles = [];
    this.didStarted = false;
    this.birds.forEach((bird) => bird.resetState());

    this.start(io, roomId);
  }
}

export default Game;
