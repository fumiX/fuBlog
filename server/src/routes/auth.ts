import { isNotNull, OAuthProvider, OAuthProvidersDto, UserRole, UserRolePermissions } from "@fumix/fu-blog-common";
import express, { CookieOptions, NextFunction, Request, Response, Router } from "express";
import fetch from "node-fetch";
import { BaseClient, CallbackParamsType, generators, Issuer, TokenSet } from "openid-client";
import { getRedirectURI } from "../auth/middleware.js";
import { OAuthAccountEntity } from "../entity/OAuthAccount.entity.js";
import { createOAuthAccount, createUser, findOAuthAccountBy } from "../service/crud.js";
import { OAuthSettings } from "../settings.js";

const router: Router = express.Router();

enum StatusCode {
  Unauthorized = 401,
}

const oauthClients: { [provider: string]: BaseClient | undefined } = {};
OAuthSettings.PROVIDERS.forEach((p) => {
  oauthClients[p.getIdentifier()] = undefined;
});

router.post("/providers", async (req: Request, res: Response) => {
  const state = req.body.state;
  if (!state || state.length < 5) {
    res.status(400).json({ error: "Insufficient state!" });
  } else {
    const result: OAuthProvidersDto = {
      providers: (
        await Promise.all(
          OAuthSettings.PROVIDERS.map(async (it) => {
            const fullStateString = `${it.type}/${it.domain}/${state}`;
            const url = await getAuthorizationUrl(it, "http://localhost:5010/login", fullStateString);
            return url
              ? {
                  label: "Login via " + it.domain,
                  url,
                }
              : null;
          }),
        )
      ).filter(isNotNull),
    };
    res.status(200).json(result);
  }
});

async function getAuthorizationUrl(oauthProvider: OAuthProvider, redirect_uri: string, state: string): Promise<string | undefined> {
  if (!oauthClients[oauthProvider.getIdentifier()]) {
    oauthClients[oauthProvider.getIdentifier()] = await Issuer.discover(`https://${oauthProvider.domain}`)
      .then((issuer) => {
        return new issuer.Client({
          client_id: oauthProvider.clientId,
          client_secret: oauthProvider.clientSecret,
          redirect_uris: ["http://localhost:5010/auth"],
        });
      })
      .catch((reason) => {
        console.error("Failed to initialize OAuth client: ", reason);
        return undefined;
      });
  }
  return (
    oauthClients[oauthProvider.getIdentifier()]?.authorizationUrl({
      ...oauthProvider.getAuthorizeQueryParams(),
      ...{ client_id: oauthProvider.clientId, redirect_uri, state },
    }) ?? undefined
  );
}

router.post("/code", async (req, res) => {
  const code = req.body.code;
  const domain = req.body.domain;
  const type = req.body.type;
  const provider = OAuthSettings.PROVIDERS.find((it) => it.domain === domain && it.type === type);
  if (!code || !domain || !type || !provider) {
    res.status(400);
  } else {
    const client = oauthClients[OAuthSettings.findByTypeAndDomain(type, domain)?.getIdentifier() ?? ""];
    if (client) {
      const params = client.callbackParams(req);
      const tokenSet = await client.callback("http://localhost:5010/login", params);
      console.log("Token set ", tokenSet);
    }
    const token = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: code,
        client_id: provider.clientId,
        client_secret: provider.clientSecret,
        redirect_uri: "http://localhost:5010/login",
        grant_type: "authorization_code",
      }),
    });
    token.json().then((tokenJson) => {
      console.log("Token", tokenJson);
    });
    /*
    token
      .json()
      .then((tokenJson) => {
        console.log("Token", tokenJson);
        console.log("Client", provider.client);
        provider.client
          .then((client) => {
            console.log("Token2", tokenJson);
            client?.userinfo((tokenJson as bla).access_token).then((userinfo) => console.log("UserInfo", userinfo));
            client
              ?.grant({
                grant_type: "idToken",
              })
              .then((g) => {
                console.log("g", g);
              });
          })
          .catch((reason) => {
            res.status(402);
          });
        res.status(200).json(tokenJson);
      })
      .catch((reason) => {
        res.status(401);
      });*/
  }
});

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
      const provider = OAuthSettings.PROVIDERS.find((it) => it.type === issuerId);
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
  console.log("[authenticate] req.originalUrl: ", req.originalUrl);

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

export default router;
