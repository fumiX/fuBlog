import { Buffer } from "buffer";
import * as console from "console";

export type DataUrl = `data:${string};base64,${string}`;

export function bytesToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

export function bytesToBase64URL(bytes: Uint8Array): string {
  // TODO: Replace with `Buffer.from(bytes).toString("base64url")` as soon as we can be sure that Node > 19.5 is used
  // and browsers support it (see https://github.com/nodejs/node/issues/26512)
  return bytesToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function base64ToBytes(base64: string): Uint8Array {
  return new Uint8Array(Buffer.from(base64, "base64"));
}

export function base64UrlToBytes(base64: string): Uint8Array {
  return new Uint8Array(Buffer.from(base64, "base64url"));
}

export function bytesToDataUrl(mimeType: string, bytes: Uint8Array): DataUrl {
  return `data:${mimeType};base64,${bytesToBase64(bytes)}`;
}

/** See https://en.wikipedia.org/wiki/JPEG */
const MAGIC_JFIF_BYTES = <const>[0xff, 0xd8, 0xff];
/** See http://libpng.org/pub/png/spec/1.2/PNG-Rationale.html#R.PNG-file-signature */
const MAGIC_PNG_BYTES = <const>[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export function imageBytesToDataUrl(bytes: Uint8Array | undefined): DataUrl | undefined {
  if (!bytes) {
    return bytes;
  } else if (doMagicBytesMatch(MAGIC_JFIF_BYTES, bytes)) {
    return bytesToDataUrl("image/jpeg", bytes);
  } else if (doMagicBytesMatch(MAGIC_PNG_BYTES, bytes)) {
    return bytesToDataUrl("image/png", bytes);
  }
  console.warn("Unknown image type, could not identify magic bytes", bytes.slice(0, Math.min(bytes.byteLength, 12)));
  return undefined;
}

function doMagicBytesMatch(magicBytes: readonly number[], allBytes: Uint8Array) {
  return magicBytes.length < allBytes.length && magicBytes.every((it, i) => allBytes[i] === it);
}
