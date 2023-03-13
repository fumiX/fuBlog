import { bytesToBase64URL } from "./base64.js";
import { Buffer } from "buffer";
import * as crypto from "crypto";

function realCreateJwtToken(secretKey: string, head: string, body: string): string {
  return `${head}.${body}.` + crypto.createHmac("sha256", secretKey).update(`${head}.${body}`).digest("base64url");
}

function objectToBase64Url<T>(o: T): string {
  return bytesToBase64URL(Buffer.from(JSON.stringify(o), "utf8"));
}

/**
 * @param secretKey
 * @param body
 */
export function createJwtToken<T>(secretKey: string, body: T): string {
  return realCreateJwtToken(secretKey, objectToBase64Url({ alg: "HS256", typ: "JWT" }), objectToBase64Url(body));
}
