import { GameObject } from "../game/game";
import { canvasHeight, canvasWidth } from "../globals";

export interface IBird {
  id: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  gravity: number;
  width: number;
  height: number;
  username: string;
  score: number;
  alive: boolean;
  dodgedObstacle: Set<number>;
  update: () => void;
  flap: () => void;
  resetState: () => void;
}

class Bird implements IBird {
  score: number;
  alive: boolean;
  dodgedObstacle: Set<number> = new Set<number>();

  constructor(
    public id: string,
    public x: number,
    public y: number,
    public dx: number,
    public dy: number,
    public gravity: number,
    public width: number,
    public height: number,
    public username: string
  ) {
    // super();
    this.alive = true;
    this.score = 0;
  }

  // update(): void {
  //   if (this.alive) {
  //     if (this.y < 0) {
  //       this.y = 0;
  //     }

  //     if (this.y + this.height > canvasHeight) {
  //       this.dy = 0;
  //       this.gravity = 0;
  //       // this.alive = false;
  //     }

  //     this.dy += this.gravity;
  //     this.y += this.dy;
  //   }
  // }

  update(): void {
    if (this.alive) {
      // Prevent bird from moving above the top of the canvas
      if (this.y < 0) {
        this.y = 0;
      }

      // Update vertical position and apply gravity
      this.dy += this.gravity;
      this.y += this.dy;

      // Prevent bird from falling out of the bottom of the screen
      if (this.y + this.height > canvasHeight) {
        this.y = canvasHeight - this.height; // Set y to the bottom of the canvas
        this.dy = 0; // Stop any downward movement
      }
    }
  }

  flap(): void {
    this.dy = -5;
  }

  resetState(): void {
    this.x = canvasWidth / 2 - this.width / 2;
    this.y = canvasHeight / 2 - this.height / 2;
    this.alive = true;
    this.score = 0;
    this.dodgedObstacle.clear();
  }
}

export default Bird;
