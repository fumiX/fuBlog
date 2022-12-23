import express, { Request, Response, Router } from "express";
import { CallbackParamsType, generators, TokenSet } from "openid-client";
import { getRedirectURI } from "../auth/middleware.js";


const router: Router = express.Router();

/**
 * Provides the URL used for authentication / authorization used to redirect the client to the OAuth authorization server.
 * <p>Before retrieving authorization information the client must authenticate (provide credentials) first.
 * <p>It uses PKCE (Proof Key for Code Exchange) to prevent Cross-Site-Request-Forgery (CSRF) and authentication code
 * injections attacks. For more information visit: {@link https://oauth.net/2/pkce/}
 */
router.get("/url", (req: Request, res: Response) => {

    // This is an extract from https://github.com/panva/node-openid-client#AuthorizationCodeFlow
    const codeVerifier = generators.codeVerifier();
    const codeChallenge = generators.codeChallenge(codeVerifier);
    const authUrl = req.app.authClient!.authorizationUrl({
        scope: "openid email profile",
        code_challenge: codeChallenge,
        code_challenge_method: "S256"
    });

    // TODO: This is only for testing - the code verifier should be stored in the session. In case of a cookie it
    //  should be httpOnly, encrypted and not readable by JavaScript
    req.app.codeVerifier = codeVerifier;
    res.json({ authUrl });
});

/** Retrieves a collection of requested tokens in exchange for an authorization code */
router.get("/callback", async (req: Request, res: Response) => {
    // The params containing the authorization code
    const client = req.app.authClient;
    if (client) {
        const params: CallbackParamsType = client.callbackParams(req);
        const checks = { code_verifier: req.app.codeVerifier };
        const tokenSet: TokenSet = await client.callback(getRedirectURI(), params, checks);
        const userinfo = await client.userinfo(tokenSet);
        console.log("THE USER INFO OBJECT", userinfo);
        res.status(200);
    }
});

export default router;
