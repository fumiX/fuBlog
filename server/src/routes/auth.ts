import express, { NextFunction, Request, Response, Router } from "express";
import { CallbackParamsType, generators, TokenSet } from "openid-client";
import { getRedirectURI } from "../auth/middleware.js";
import { findOAuthAccountBy } from "../service/crud.js";
import { SupportedOAuthProviders, findOAuthProviderById } from "@fumix/fu-blog-common";

const router: Router = express.Router();
enum StatusCode {
  Unauthorized = 401
}

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

/**
 * Retrieves a collection of requested tokens in exchange for an authorization code.
 */
router.get("/callback", async (req: Request, res: Response) => {
  // The params containing the authorization code
  const client = req.app.authClient;
  if (client) {
    const params: CallbackParamsType = client.callbackParams(req);
    const checks = { code_verifier: req.app.codeVerifier };
    const tokenSet: TokenSet = await client.callback(getRedirectURI(), params, checks);
    const userInfo = await client.userinfo(tokenSet);

    const issuerId = req.app.authIssuer?.metadata.issuer;
    if (issuerId) {
      const supported = findOAuthProviderById(issuerId);
      if (supported) {
        const account = await findOAuthAccountBy(userInfo.sub, supported);
        // Create the new OAuth account with the user id and supported provider
        if (!account) {
          console.log("No Such accounts exist");
        }
      }
    }
    res.status(200).json(userInfo);
  }
});

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const client = req.app.authClient;
  if (client) {
    const accessToken = req.headers["x-access-token"];
    console.log("X-Access-Token", accessToken);
    if (accessToken) {
      // //     const params: CallbackParamsType = client.callbackParams(req);
      // //     const checks = { code_verifier: req.app.codeVerifier };
      // //     const tokens: TokenSet = await client.callback(getRedirectURI(), params, checks);
      // //     if (tokens.expired()) {
      // //         const refreshedTokens = await client.refresh(tokens);
      // //         res.setHeader("x-access-token", refreshedTokens.access_token)
      // //         req.headers["x-access-token"] = refreshedTokens.access_token;
      // //     }
    } else {
      res.status(StatusCode.Unauthorized.valueOf()).json({
        data: {
          error: "Missing access token"
        }
      });
    }
  }
  // next();
}

export default router;
