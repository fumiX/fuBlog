import { NextFunction, Request, Response } from "express";
import { Issuer } from "openid-client";

export async function init(req: Request, res: Response, next: NextFunction) {
    const initialized = !!req.app.authIssuer && req.app.authClient;
    if (!initialized) {
        const issuer = await Issuer.discover("https://accounts.google.com");
        const client = new issuer.Client({
            client_id: process.env.OAUTH_CLIENT_ID!,
            client_secret: process.env.OAUTH_CLIENT_SECRET!,
            redirect_uris: [`${getDomain()}`],
            response_types: ["code"]
        });
        req.app.authIssuer = issuer;
        req.app.authClient = client;
    }
    next();
}

export function getDomain(): string {
    return `http://${process.env.APP_HOST}:${process.env.APP_PORT}/`;
}
