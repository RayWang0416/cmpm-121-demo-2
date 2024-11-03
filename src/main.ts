import "./style.css";

const APP_NAME = "Cat";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = `<h1>${APP_NAME}</h1>`;

//canvas constants and variables
let isDrawing = false;
let lines: Array<MarkerLine> = [];
let redoStack: Array<MarkerLine> = [];

//canvas
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 256;
canvas.height = 256;
canvas.id = "canvas1";
app.appendChild(canvas);
app.appendChild(document.createElement("br"));

//class representing a line marker
class MarkerLine {
    private points: Array<{ x: number; y: number }> = [];

    constructor(initialX: number, initialY: number) {
        this.points.push({ x: initialX, y: initialY });
    }

    display(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        if (this.points.length > 0) {
            ctx.moveTo(this.points[0].x, this.points[0].y);
            for (let i = 1; i < this.points.length; i++) {
                ctx.lineTo(this.points[i].x, this.points[i].y);
            }
        }
        ctx.stroke();
        ctx.closePath();
    }

    drag(x: number, y: number) {
        this.points.push({ x, y });
    }
}

//CANVAS DRAWING
//drawing changed event
canvas.addEventListener("drawing-changed", () => {
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawCanvas(ctx, lines);
    }
});

//mouse down
canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    redoStack = [];
    lines.push(new MarkerLine(e.offsetX, e.offsetY));
    canvas.dispatchEvent(new Event("drawing-changed"));
});

//mouse move
canvas.addEventListener("mousemove", (e) => {
    if (isDrawing) {
        const currentLine = lines[lines.length - 1];
        currentLine.drag(e.offsetX, e.offsetY);
        canvas.dispatchEvent(new Event("drawing-changed"));
    }
});

//mouse up
window.addEventListener("mouseup", () => {
    isDrawing = false;
});

function redrawCanvas(context: CanvasRenderingContext2D, line: Array<MarkerLine>) {
    context.strokeStyle = "black";
    context.lineWidth = 1;
    for (const l of line) {
        l.display(context);
    }
}

//clear canvas button
const clearButton = document.createElement("button");
clearButton.innerText = "Clear";
app.appendChild(clearButton);

clearButton.addEventListener("click", () => {
    lines = [];
    redoStack = [];
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
});

//undo button
const undoButton = document.createElement("button");
undoButton.innerText = "Undo";
app.appendChild(undoButton);

undoButton.addEventListener("click", () => {
    if (lines.length > 0) {
        const lastLine = lines.pop();
        if (lastLine) {
            redoStack.push(lastLine);
            canvas.dispatchEvent(new Event("drawing-changed"));
        }
    }
});

//redo button
const redoButton = document.createElement("button");
redoButton.innerText = "Redo";
app.appendChild(redoButton);

redoButton.addEventListener("click", () => {
    if (redoStack.length > 0) {
        const lineToRedo = redoStack.pop();
        if (lineToRedo) {
            lines.push(lineToRedo);
            canvas.dispatchEvent(new Event("drawing-changed"));
        }
    }
});
