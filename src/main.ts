import "./style.css";

// Application constants
const CANVAS_WIDTH = 512;
const CANVAS_HEIGHT = 512;
const DEFAULT_PEN_COLOR = "black";
const DEFAULT_BRUSH_COLOR = "red";


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
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
canvas.id = "canvas1";
app.appendChild(canvas);
app.appendChild(document.createElement("br"));

const penColor = DEFAULT_PEN_COLOR;
const brushColor = DEFAULT_BRUSH_COLOR;
let currentColor = penColor;

//class representing a line marker
class MarkerLine {
    private points: Array<{ x: number; y: number }> = [];
    private lineWidth: number;
    private color: string;

    constructor(initialX: number, initialY: number, lineWidth: number) {
        this.points.push({ x: initialX, y: initialY });
        this.lineWidth = lineWidth;
        this.color = currentColor;
    }

    display(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.color;
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
    private angle: number;s

    constructor(x: number, y: number, sticker: string) {
        this.x = x;
        this.y = y;
        this.sticker = sticker;
        this.angle = stickerRotationAngle;
    }

    display(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.angle * Math.PI) / 180);
        ctx.font = "24px Arial";
        ctx.fillText(this.sticker, 0, 0);
        ctx.restore();
    }

    drag(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.angle = stickerRotationAngle;
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
thinMarkerButton.innerText = "Pen";
app.appendChild(thinMarkerButton);

thinMarkerButton.addEventListener("click", () => {
    currentLineWidth = 3;
    currentColor = penColor;
    currentSticker = null;
    thinMarkerButton.classList.add("selectedTool");
    thickMarkerButton.classList.remove("selectedTool");
    stickerButtons.forEach(button => button.classList.remove("selectedTool"));
});

//thick marker button
const thickMarkerButton = document.createElement("button");
thickMarkerButton.innerText = "Brush";
app.appendChild(thickMarkerButton);

thickMarkerButton.addEventListener("click", () => {
    currentLineWidth = 6;
    currentColor = brushColor;
    currentSticker = null;
    thickMarkerButton.classList.add("selectedTool");
    thinMarkerButton.classList.remove("selectedTool");
    stickerButtons.forEach(button => button.classList.remove("selectedTool"));
});

//set default marker to thin
thinMarkerButton.classList.add("selectedTool");

//sticker buttons
const stickers = ["🌟", "🌈", "🎉"];
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

//custom sticker button
const customStickerButton = document.createElement("button");
customStickerButton.innerText = "Add Custom Sticker";
app.appendChild(customStickerButton);

customStickerButton.addEventListener("click", () => {
    const customStickerText = prompt("Enter custom sticker text:", "");
    if (customStickerText) {
        currentSticker = customStickerText;
        currentLineWidth = 0;
        customStickerButton.classList.add("selectedTool");
        thinMarkerButton.classList.remove("selectedTool");
        thickMarkerButton.classList.remove("selectedTool");
        stickerButtons.forEach(button => button.classList.remove("selectedTool"));
    }
});

//slide for stickers
const rotationSlider = document.createElement("input");
rotationSlider.type = "range";
rotationSlider.min = "0";
rotationSlider.max = "360";
rotationSlider.value = "0";
rotationSlider.id = "rotationSlider";
app.appendChild(document.createTextNode("Rotation: "));
app.appendChild(rotationSlider);

let stickerRotationAngle = 0;

rotationSlider.addEventListener("input", (e) => {
    stickerRotationAngle = parseInt((e.target as HTMLInputElement).value);
});


//export button
const exportButton = document.createElement("button");
exportButton.innerText = "Export as PNG";
app.appendChild(exportButton);

exportButton.addEventListener("click", () => {
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = 1024;
    exportCanvas.height = 1024;
    const exportCtx = exportCanvas.getContext("2d");
    if (exportCtx) {
        exportCtx.scale(4, 4);
        redrawCanvas(exportCtx, lines);
        const anchor = document.createElement("a");
        anchor.href = exportCanvas.toDataURL("image/png");
        anchor.download = "sketchpad.png";
        anchor.click();
    }
});

// Dynamic Tool Preview Class
class ToolPreview {
    private previewElement: HTMLDivElement;

    constructor() {
        this.previewElement = document.createElement("div");
        this.previewElement.style.position = "absolute";
        this.previewElement.style.pointerEvents = "none";
        this.previewElement.style.borderRadius = "50%";
        this.previewElement.style.border = "1px solid rgba(0, 0, 0, 0.2)";
        this.previewElement.style.zIndex = "1000";
        document.body.appendChild(this.previewElement);
        this.hide();
    }

    show(x: number, y: number, size: number, color: string) {
        this.previewElement.style.width = `${size}px`;
        this.previewElement.style.height = `${size}px`;
        this.previewElement.style.backgroundColor = color;
        this.previewElement.style.left = `${x - size / 2}px`;
        this.previewElement.style.top = `${y - size / 2}px`;
        this.previewElement.style.display = "block";
    }

    hide() {
        this.previewElement.style.display = "none";
    }
}

const toolPreview = new ToolPreview();

// Add mousemove and mouseleave event listeners to canvas
canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    toolPreview.show(event.clientX, event.clientY, currentLineWidth * 5, currentColor);
});

canvas.addEventListener("mouseleave", () => {
    toolPreview.hide();
});
