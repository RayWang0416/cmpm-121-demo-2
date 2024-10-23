import "./style.css";

const APP_NAME = "Cat";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = `<h1>${APP_NAME}</h1>`;

//canvas constants and variables
let isDrawing = false;
let x = 0;
let y = 0;
let lines: Array<Array<{ x: number; y: number }>> = [];

//Canvas
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 256;
canvas.height = 256;
canvas.id = "canvas1";
app.appendChild(canvas);

//canvas drawing
canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    lines.push([{ x: e.offsetX, y: e.offsetY }]);
    canvas.dispatchEvent(new Event("drawing-changed"));
});
  
canvas.addEventListener("mousemove", (e) => {
    if (isDrawing) {
        const currentSegment = lines[lines.length - 1];
        currentSegment.push({ x: e.offsetX, y: e.offsetY });
        canvas.dispatchEvent(new Event("drawing-changed"));
    }
});
  
window.addEventListener("mouseup", () => {
    isDrawing = false;
});
  
canvas.addEventListener("drawing-changed", () => {
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawCanvas(ctx, lines);
    }
});

function redrawCanvas(context: CanvasRenderingContext2D, line: Array<Array<{ x: number; y: number }>>) {
    context.beginPath();
    context.strokeStyle = "black";
    context.lineWidth = 1;
    for (const l of line) {
        if (l.length > 0) {
            context.moveTo(l[0].x, l[0].y);
            for (let i = 1; i < l.length; i++) {
                context.lineTo(l[i].x, l[i].y);
            }
        }
    }
    context.stroke();
    context.closePath();
}

//clear canvas button
const clearButton = document.createElement("button");
clearButton.innerText = "Clear";
app.appendChild(clearButton);

clearButton.addEventListener("click", () => {
    lines = [];
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
});
  

  

