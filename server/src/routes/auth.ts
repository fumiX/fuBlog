import express, { CookieOptions, NextFunction, Request, Response, Router } from "express";
import { CallbackParamsType, generators, TokenSet } from "openid-client";
import { getRedirectURI } from "../auth/middleware.js";
import { createOAuthAccount, createUser, findOAuthAccountBy } from "../service/crud.js";
import { findOAuthProviderById, UserRole, UserRolePermissions } from "@fumix/fu-blog-common";
import { OAuthAccountEntity } from "../entity/OAuthAccount.entity.js";

const router: Router = express.Router();

const SESSION_COOKIE = "session";

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
    code_challenge_method: "S256",
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
    // console.log("THE ID TOKEN: ", tokenSet.id_token);
    console.log("What the hell is session state? ", tokenSet.session_state);
    const userPermissions: UserRolePermissions = {} as UserRolePermissions;
    const issuerId = req.app.authIssuer?.metadata.issuer;
    if (issuerId) {
      const provider = findOAuthProviderById(issuerId);
      if (provider) {
        let account: OAuthAccountEntity | null = await findOAuthAccountBy(userInfo.sub, provider);
        if (!account) {
          const firstName = userInfo.name as string;
          const lastName = userInfo.family_name as string;
          const email = userInfo.email as string;
          const bloggerRoles: UserRole[] = ["POST_CREATE", "POST_EDIT"];
          const user = await createUser(firstName, email, bloggerRoles, firstName, lastName);
          account = await createOAuthAccount(userInfo.sub, provider, user);
        }
        // const userId = account.user.id as number;
        // userPermissions = await getUserPermissions(userId);
      }
    }

    console.log("Headers / Cookies ", res.getHeaderNames(), req.cookies);
    // res.location("http://localhost:5010/auth");
    // res.send(302);
    // res.redirect("http://localhost:5010/auth");
    res.setHeader("Authorization", tokenSet.access_token as string);
    res.redirect("http://localhost:5010/api/posts/page/1/count/5");
  }
});

export function authenticate(req: Request, res: Response, next: NextFunction) {
  console.log("[authenticate} req.origianUrl: ", req.originalUrl);

  const reqHeaders = req.headers.authorization;
  const resHeaders = res.getHeader("Authorization");
  const accessTokenHeaderValue = req.headers["x-access-token"];
  const resAccessToken = res.getHeader("x-access-token");

  const client = req.app.authClient;
  if (client) {
    if (accessTokenHeaderValue) {
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
          error: "Missing access token",
        },
      });
    }
  }
  // next();
}

/**
 * Sets an authentication cookie
 * @param {Response} res The server response
 * @param {string} value The value of the cookie
 * */
export function setAuthCookie(res: Response, value: string): void {
  /**
   * @property {number} maxAge The maximum time (in seconds) before the cookie
   * will be removed by the web browser
   * @property {boolean} httpOnly
   * Disables access from JavaScript resulting in queries like:
   * <code>document.cookie</code> returning undefined
   * @property {boolean} secure Should be turned on in a production environment
   */
  const options: CookieOptions = {
    maxAge: 3600 * 24 * 182,
    httpOnly: true,
    // only access from our site
    // Unfortunately the cookie behavior has recently changed
    // and so we need to do this in order for the redirects to carry on our state cookie
    sameSite: false,
    secure: false,
  };
  res.cookie(SESSION_COOKIE, value, options);
}

export function getAuthCookie(req: Request): string {
  return req.cookies[SESSION_COOKIE];
}

export default router;
