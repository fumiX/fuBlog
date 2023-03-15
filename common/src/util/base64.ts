import { Buffer } from "buffer";

export function bytesToBase64URL(bytes: Uint8Array): string {
  // TODO: Replace with `Buffer.from(bytes).toString("base64url")` as soon as we can be sure that Node > 19.5 is used (see https://github.com/nodejs/node/issues/26512)
  return Buffer.from(bytes).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
