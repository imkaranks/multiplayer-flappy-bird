import "./style.css";
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

let canvasWidth: number;
let canvasHeight: number;

function init() {
  canvasWidth = canvas.width = window.innerWidth;
  canvasHeight = canvas.height = window.innerHeight;
}

function animate() {
  if (!ctx) {
    return;
  }

  ctx.fillText("Start Working", canvasWidth / 2, canvasHeight / 2);
  ctx.textBaseline = "middle";
}

window.addEventListener("resize", init);

window.addEventListener("load", () => {
  init();
  animate();
});
