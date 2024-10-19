import { GameObject } from "../game/game";

export interface IObstacle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  width: number;
  height: number;
  top: boolean;
  toDelete: boolean;
  update: () => void;
}

class Obstacle implements IObstacle {
  toDelete: boolean;

  constructor(
    public x: number,
    public y: number,
    public dx: number,
    public dy: number,
    public width: number,
    public height: number,
    public top = false
  ) {
    // super();
    this.toDelete = false;
  }

  update(): void {
    // Move the Obstacle to the left
    this.x -= this.dx;

    if (this.x + this.width <= 0) {
      this.toDelete = true;
    }
  }
}

export default Obstacle;
