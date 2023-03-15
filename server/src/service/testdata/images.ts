import { Sex, SexType } from "@faker-js/faker";
import { faker } from "@faker-js/faker/locale/de";
import { Canvas, CanvasRenderingContext2D, createCanvas } from "canvas";
import fetch from "node-fetch";

export async function generateProfilePicture(seed: number, sex: SexType, width = 256, height = 256): Promise<Blob> {
  const url = faker.image.imageUrl(width, height, sex === Sex.Male ? "boy,man" : "girl,woman", true);
  return fetch(url)
    .then((response) =>
      response
        .arrayBuffer()
        .then((buf) => new Blob([buf], { type: "image/jpg" }))
        .catch(() => generateRandomPng(seed, width, height)),
    )
    .catch(() => generateRandomPng(seed, width, height));
}

const RANDOM_PNG_X = 4;
const RANDOM_PNG_Y = 4;

export async function generateRandomPng(seed?: number, width = 256, height = 256): Promise<Blob> {
  width = Math.max(RANDOM_PNG_X, width);
  height = Math.max(RANDOM_PNG_Y, height);

  const pxWidth = Math.ceil(width / RANDOM_PNG_X);
  const pxHeight = Math.ceil(height / RANDOM_PNG_Y);

  return new Promise((resolve) => {
    faker.seed(seed);

    const canvas: Canvas = createCanvas(width, height);
    const context: CanvasRenderingContext2D = canvas.getContext("2d", { alpha: false, pixelFormat: "RGB24" });

    const randomColorComponent = () => faker.datatype.number({ min: 0, max: 0xff });
    for (let x = 0; x < RANDOM_PNG_X; x++) {
      for (let y = 0; y < RANDOM_PNG_Y; y++) {
        context.fillStyle = `rgb(${randomColorComponent()}, ${randomColorComponent()}, ${randomColorComponent()})`;
        context.fillRect(x * pxWidth, y * pxHeight, pxWidth, pxHeight);
      }
    }
    resolve(new Blob([canvas.toBuffer("image/png")], { type: "image/png" }));
  });
}
