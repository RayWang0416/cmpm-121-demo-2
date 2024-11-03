import "./style.css";

const APP_NAME = "Cat";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = `<h1>${APP_NAME}</h1>`;

//canvas constants and variables
let isDrawing = false;
let lines: Array<MarkerLine | Sticker> = [];
let redoStack: Array<MarkerLine | Sticker> = [];
let currentLineWidth = 1;
let currentSticker: string | null = null;

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
    private lineWidth: number;

    constructor(initialX: number, initialY: number, lineWidth: number) {
        this.points.push({ x: initialX, y: initialY });
        this.lineWidth = lineWidth;
    }

    display(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.lineWidth = this.lineWidth;
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

//class representing a sticker
class Sticker {
    private x: number;
    private y: number;
    private sticker: string;

    constructor(x: number, y: number, sticker: string) {
        this.x = x;
        this.y = y;
        this.sticker = sticker;
    }

    display(ctx: CanvasRenderingContext2D) {
        ctx.font = "20px Arial";
        ctx.fillText(this.sticker, this.x, this.y);
    }

    drag(x: number, y: number) {
        this.x = x;
        this.y = y;
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
    if (currentSticker) {
        lines.push(new Sticker(e.offsetX, e.offsetY, currentSticker));
    } else {
        lines.push(new MarkerLine(e.offsetX, e.offsetY, currentLineWidth));
    }
    canvas.dispatchEvent(new Event("drawing-changed"));
});

//mouse move
canvas.addEventListener("mousemove", (e) => {
    if (isDrawing) {
        const currentLine = lines[lines.length - 1];
        if (currentLine instanceof MarkerLine) {
            currentLine.drag(e.offsetX, e.offsetY);
        } else if (currentLine instanceof Sticker) {
            currentLine.drag(e.offsetX, e.offsetY);
        }
        canvas.dispatchEvent(new Event("drawing-changed"));
    } else {
        const cursorSize = currentLineWidth;
        canvas.style.cursor = `none`;
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            redrawCanvas(ctx, lines);
            if (currentSticker) {
                ctx.font = "20px Arial";
                ctx.fillText(currentSticker, e.offsetX, e.offsetY);
            } else {
                ctx.beginPath();
                ctx.arc(e.offsetX, e.offsetY, cursorSize / 2, 0, 2 * Math.PI);
                ctx.fillStyle = "black";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
});

//mouse out
canvas.addEventListener("mouseout", () => {
    canvas.style.cursor = "default";
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawCanvas(ctx, lines);
    }
});

//mouse up
window.addEventListener("mouseup", () => {
    isDrawing = false;
});

function redrawCanvas(context: CanvasRenderingContext2D, line: Array<MarkerLine | Sticker>) {
    context.strokeStyle = "black";
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

//thin marker button
const thinMarkerButton = document.createElement("button");
thinMarkerButton.innerText = "Thin Marker";
app.appendChild(thinMarkerButton);

thinMarkerButton.addEventListener("click", () => {
    currentLineWidth = 1;
    currentSticker = null;
    thinMarkerButton.classList.add("selectedTool");
    thickMarkerButton.classList.remove("selectedTool");
    stickerButtons.forEach(button => button.classList.remove("selectedTool"));
});

//thick marker button
const thickMarkerButton = document.createElement("button");
thickMarkerButton.innerText = "Thick Marker";
app.appendChild(thickMarkerButton);

thickMarkerButton.addEventListener("click", () => {
    currentLineWidth = 5;
    currentSticker = null;
    thickMarkerButton.classList.add("selectedTool");
    thinMarkerButton.classList.remove("selectedTool");
    stickerButtons.forEach(button => button.classList.remove("selectedTool"));
});

// sticker buttons
const stickers = ["😀", "🐱", "🌟"];
const stickerButtons: HTMLButtonElement[] = [];
stickers.forEach((sticker) => {
    const button = document.createElement("button");
    button.innerText = sticker;
    app.appendChild(button);
    stickerButtons.push(button);

    button.addEventListener("click", () => {
        currentSticker = sticker;
        currentLineWidth = 0;
        button.classList.add("selectedTool");
        thinMarkerButton.classList.remove("selectedTool");
        thickMarkerButton.classList.remove("selectedTool");
        stickerButtons.forEach(b => {
            if (b !== button) b.classList.remove("selectedTool");
        });
    });
});

//set default marker to thin
thinMarkerButton.classList.add("selectedTool");