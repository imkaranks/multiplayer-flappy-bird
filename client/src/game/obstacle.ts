const obstacleTopImage = new Image();
obstacleTopImage.src = "/pipe-green-top.png";

const obstacleBottomImage = new Image();
obstacleBottomImage.src = "/pipe-green.png";

export default class Obstacle {
  private image: HTMLImageElement;

  constructor(
    private ctx: CanvasRenderingContext2D,
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public top: boolean
  ) {
    this.image = top ? obstacleTopImage : obstacleBottomImage;
  }

  draw() {
    const imageHeight = this.image.height;
    const imageWidth = this.image.width;

    // Calculate the crop height based on whether it's a top or bottom obstacle
    const cropY = this.top ? imageHeight - this.height : 0; // Crop from bottom if top is true

    // Calculate the height to draw based on top/bottom
    const drawHeight = this.top ? this.height : imageHeight - this.height;

    this.ctx.drawImage(
      this.image,
      0,
      cropY, // Start cropping from the calculated cropY
      imageWidth,
      drawHeight, // Height to draw
      this.x,
      this.y,
      this.width,
      this.height
    );

    // this.ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  returnToPool(obstaclePool: Obstacle[]) {
    // Logic to return this instance to the pool
    obstaclePool.push(this);
  }
}
