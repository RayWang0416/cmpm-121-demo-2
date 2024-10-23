import "./style.css";

const APP_NAME = "Cat";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = `<h1>${APP_NAME}</h1>`;

//Canvas
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.id = "canvas1";
app.appendChild(canvas);
