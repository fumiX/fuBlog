import { loadIdToken } from "@/util/storage.js";

export type ApiUrl = `/api/${string}`;

export async function callServer(url: ApiUrl, method: "GET" | "POST", body?: BodyInit | null, authenticated = true): Promise<Response> {
  const token = authenticated ? loadIdToken() : undefined;
  const headers: HeadersInit = token
    ? { "X-OAuth-Type": token.type, "X-OAuth-Issuer": token.issuer, Authorization: `Bearer ${token.id_token}` }
    : {};
  return fetch(url, {
    headers,
    body,
  });
}
