import { isNotNull, OAuthProvider, OAuthProvidersDto, OAuthUserInfoDto, UserRole, UserRolePermissions } from "@fumix/fu-blog-common";
import express, { NextFunction, Request, Response, Router } from "express";
import fetch from "node-fetch";
import { BaseClient, CallbackParamsType, generators, Issuer, TokenSet } from "openid-client";
import { AppDataSource } from "../data-source.js";
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
            const url = await getAuthorizationUrl(it, OAuthSettings.REDIRECT_URI, fullStateString);
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
          id_token_signed_response_alg: oauthProvider.getIdTokenSignedResponseAlg(),
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
  const issuer = req.body.issuer;
  const type = req.body.type;
  const provider = OAuthSettings.findByTypeAndDomain(type, issuer);
  if (!code || !issuer || !type || !provider) {
    res.status(400);
  } else {
    const client = oauthClients[OAuthSettings.findByTypeAndDomain(type, issuer)?.getIdentifier() ?? ""];
    if (client) {
      const tokenSet = await client.callback(OAuthSettings.REDIRECT_URI, client.callbackParams(req));
      const userInfo = await client.userinfo(tokenSet, { method: "POST", via: "body" });
      const dbUser = await AppDataSource.manager.getRepository(OAuthAccountEntity).findOne({
        where: {
          type: type,
          domain: issuer,
          oauthId: userInfo.sub,
        },
        relations: ["user"],
      });
      console.log("Token set ", tokenSet);
      console.log("User info ", userInfo);
      console.log("DB user", dbUser);

      if (tokenSet.id_token) {
        const result: OAuthUserInfoDto = {
          id_token: tokenSet.id_token,
          user: {
            firstName: dbUser?.user?.firstName ?? userInfo.given_name,
            lastName: dbUser?.user?.lastName ?? userInfo.family_name,
            email: dbUser?.user?.email ?? userInfo.email,
            profilePicture: dbUser?.user?.profilePicture,
            username: dbUser?.user?.username ?? userInfo.preferred_username,
          },
          isExisting: true,
        };
        if (!result.user.profilePicture && userInfo.picture) {
          try {
            result.user.profilePicture = new Uint8Array(await (await fetch(userInfo.picture)).arrayBuffer());
          } catch (e) {
            // Ignore failing download of profile pic
          }
        }
        res.status(200).json(result);
        return;
      }
    }
    res.status(403);
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
    const tokenSet: TokenSet = await client.callback(OAuthSettings.REDIRECT_URI, params, checks);
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
