import { Canvas, CanvasRenderingContext2D, createCanvas, Image } from "canvas";

export function generateShareImage(title: string, date: Date, image: Image | Canvas | undefined = undefined): Uint8Array {
  const canvas: Canvas = createCanvas(1280, 640);
  const context: CanvasRenderingContext2D = canvas.getContext("2d", { alpha: false, pixelFormat: "RGB24" });

  context.fillStyle = "rgb(48,48,48)";
  context.fillRect(0, 0, 1280, 640);

  context.font = "bold 48px sans-serif";
  const titleWords = title.split(/\s+/).map((word) => ({ word, width: context.measureText(word).width }));

  const lines = titleWords
    .reduce(
      (acc, current) => {
        const lastLineIndex = acc.length - 1;
        if (lastLineIndex >= 0 && acc[lastLineIndex].width + current.width < 600) {
          acc[lastLineIndex].line += ` ${current.word}`;
          acc[lastLineIndex].width += current.width;
        } else {
          acc.push({ line: current.word, width: current.width });
        }
        return acc;
      },
      [] as { line: string; width: number }[],
    )
    .map((line) => line.line);
  const overlong = lines.length > 6;
  lines.length = Math.min(lines.length, 6); // max 4 lines
  if (overlong) {
    lines.push("…"); // add ellipsis
  }

  context.fillStyle = "#ff9c00";
  context.fillRect(10, 10, 620, 620);
  if (image) {
    context.drawImage(image, 20, 20, 600, 600);
  } else {
    context.fillStyle = "rgba(248, 249, 250, 0.4)";
    context.fillRect(20, 20, 600, 600);
  }
  context.fillStyle = "rgb(248, 249, 250)";
  lines.forEach((line, index) => context.fillText(line, 660, 120 + index * 60, 600));
  context.font = "normal 24px sans-serif";
  context.fillText(date.toLocaleDateString("de-DE") + " " + date.toLocaleTimeString("de-DE"), 660, 620, 600);

  return new Uint8Array(canvas.toBuffer("image/png", { compressionLevel: 9 }));
}
