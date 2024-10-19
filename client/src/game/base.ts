export default class Base {
  private dx: number;
  private speed: number;

  constructor(
    private ctx: CanvasRenderingContext2D | null,
    private image: HTMLImageElement,
    private gameCanvas: HTMLCanvasElement
  ) {
    this.dx = 0;
    this.speed = 2;

    this.draw();
  }

  draw(): void {
    if (!this.ctx) return;

    const repeat = Math.ceil(this.gameCanvas.width / this.image.width) + 1;

    for (let i = 0; i < repeat; ++i) {
      this.ctx.drawImage(
        this.image,
        0,
        0,
        this.image.width,
        this.image.height,
        i * this.image.width - this.dx,
        this.gameCanvas.height - this.image.height,
        this.image.width,
        this.image.height
      );
    }
  }

  update(): void {
    this.draw();
    this.dx = (this.dx + this.speed) % (this.image.width / 2);
  }
}
