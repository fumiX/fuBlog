import { Buffer } from "buffer";

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
