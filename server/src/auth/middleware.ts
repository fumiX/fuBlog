import { NextFunction, Request, Response } from "express";
import { Issuer } from "openid-client";
import { OAuthSettings, ServerSettings } from "../settings.js";

export async function init(req: Request, res: Response, next: NextFunction) {
  const initialized = !!req.app.authIssuer && req.app.authClient;
  if (!initialized && OAuthSettings.CLIENT_ID && OAuthSettings.CLIENT_SECRET) {
    const issuer = await Issuer.discover(OAuthSettings.PROVIDER_URL);
    const client = new issuer.Client({
      client_id: OAuthSettings.CLIENT_ID,
      client_secret: OAuthSettings.CLIENT_SECRET,
      redirect_uris: [`${getRedirectURI()}`],
      response_types: ["code"],
    });
    req.app.authIssuer = issuer;
    req.app.authClient = client;
  }
  next();
}

export function getRedirectURI(): string {
  return `${ServerSettings.PROTOCOL}://${ServerSettings.HOST}:${ServerSettings.PORT}/auth/callback`;
}
