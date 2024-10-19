export default class Bird {
  private static readonly SPRITE_WIDTH = 34;
  private static readonly SPRITE_HEIGHT = 24;
  private static readonly GRAVITY = 0.5;
  private static readonly SPRITE_FRAMES = 3;

  private sx: number = 0;
  private spriteTicker: number = 0;
  private toBeDeleted: boolean = false;
  public width: number;
  public score: number = 0;

  public image: HTMLImageElement;

  constructor(
    private ctx: CanvasRenderingContext2D | null,
    // private image: HTMLImageElement,
    public id: string,
    public x: number,
    public y: number,
    public dx: number,
    public dy: number,

    public height: number,
    public username: string,
    public isMe: boolean
  ) {
    this.width = height * (Bird.SPRITE_WIDTH / Bird.SPRITE_HEIGHT);

    this.image = new Image();
    this.image.src = !isMe ? "/red-flappy-bird.png" : "/flappy-bird.png";
  }

  draw(): void {
    if (!this.ctx) return;

    if (!this.isMe) {
      this.ctx.globalAlpha = 0.5;
    }

    this.ctx.font = "14px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillStyle = "black";

    // Calculate the text position
    const textX = this.x + this.width / 2; // Centered above the image
    const textY = this.y - 10;

    this.ctx.fillText(this.username, textX, textY);

    this.ctx.drawImage(
      this.image,
      this.sx * Bird.SPRITE_WIDTH,
      0,
      Bird.SPRITE_WIDTH,
      Bird.SPRITE_HEIGHT,
      this.x,
      this.y,
      this.width,
      this.height
    );

    this.ctx.globalAlpha = 1;
  }

  update(x: number, y: number, score: number): void {
    if (!this.ctx) return;

    this.x = x;
    this.y = y;
    this.score = score;

    if (this.spriteTicker >= 3) {
      this.sx = (this.sx + 1) % Bird.SPRITE_FRAMES;
      this.spriteTicker = 0;
    } else {
      this.spriteTicker += 1;
    }

    this.draw();
  }
}
