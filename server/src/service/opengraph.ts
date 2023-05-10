import { Canvas, CanvasRenderingContext2D, createCanvas } from "canvas";

function generateShareImage(title: string, date: Date) {
  const canvas: Canvas = createCanvas(1280, 640);
  const context: CanvasRenderingContext2D = canvas.getContext("2d", { alpha: false, pixelFormat: "RGB24" });

  context.fillStyle = "#ff0000";
  context.fillRect(20, 20, 600, 600);
  context.font = "bold 48px sans-serif";
  context.fillText(title, 660, 120, 600);
  context.font = "bold 24px sans-serif";
  context.fillText(date.toLocaleDateString("de-DE"), 660, 180, 600);

  console.log(canvas.toDataURL("image/png"));
}
