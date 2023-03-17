import { isNotNull, OAuthProvider, OAuthProvidersDto, OAuthUserInfoDto, SavedOAuthToken } from "@fumix/fu-blog-common";
import express, { NextFunction, Request, Response, Router } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import fetch from "node-fetch";
import { BaseClient, Issuer } from "openid-client";
import { AppDataSource } from "../data-source.js";
import { OAuthAccountEntity } from "../entity/OAuthAccount.entity.js";
import { findOAuthAccountBy } from "../service/crud.js";
import { OAuthSettings } from "../settings.js";

const router: Router = express.Router();

enum StatusCode {
  Unauthorized = 401,
}

const oauthClients: { [provider: string]: BaseClient | undefined } = {};
OAuthSettings.PROVIDERS.forEach((p) => {
  oauthClients[p.getIdentifier()] = undefined;
});

async function findOAuthClient(provider: OAuthProvider): Promise<BaseClient> {
  const existingValue = oauthClients[provider.getIdentifier()];
  if (!existingValue) {
    try {
      const newValue = await Issuer.discover(`https://${provider.domain}`).then((issuer) => {
        return new issuer.Client({
          client_id: provider.clientId,
          client_secret: provider.clientSecret,
          redirect_uris: [OAuthSettings.REDIRECT_URI],
          id_token_signed_response_alg: provider.getIdTokenSignedResponseAlg(),
        });
      });
      oauthClients[provider.getIdentifier()] = newValue;
      return newValue;
    } catch (e) {
      return Promise.reject(new Error("Failed to initialize OAuth client " + provider.getIdentifier() + ": " + e));
    }
  }
  return existingValue;
}

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
  try {
    const client = await findOAuthClient(oauthProvider);
    return client.authorizationUrl({
      ...oauthProvider.getAuthorizeQueryParams(),
      ...{ client_id: oauthProvider.clientId, redirect_uri, state },
    });
  } catch (e) {
    return Promise.reject(new Error("Failed to get authorization URL for provider " + oauthProvider.getIdentifier()));
  }
}

router.post("/loggedInUser", async (req, res) => {
  const savedToken = req.body as SavedOAuthToken;
  if (!savedToken) {
    res.status(400).json("Error: Can't decode body to SavedOAuthToken!");
  } else {
    const provider = OAuthSettings.findByTypeAndDomain(savedToken.type, savedToken.issuer);
    if (provider?.type === "FAKE") {
      const result = await jwtVerify(savedToken.id_token, new TextEncoder().encode("secret"));
      if (result?.payload?.sub) {
        res.status(200).json(await findOAuthAccountBy(result.payload.sub, provider));
      }
      res.status(200);
    } else if (provider?.type === "GOOGLE") {
      const jwks = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
      const result = await jwtVerify(savedToken.id_token, jwks);
      if (result?.payload?.sub) {
        res.status(200).json(await findOAuthAccountBy(result.payload.sub, provider));
      }
      res.status(200).json({});
    }
  }
});

/**
 * Endpoint to get a {@link OAuthUserInfoDto}.
 *
 * This needs an authorization code from the OAuth provider as `code`. To identify the OAuth provider, this also needs `issuer` and `type`.
 */
router.post("/userinfo", async (req, res) => {
  const code = req.body.code;
  const issuer = req.body.issuer;
  const type = req.body.type;
  const provider = OAuthSettings.findByTypeAndDomain(type, issuer);
  if (!code || !issuer || !type) {
    res.status(400).json({ error: "Requires parameters `code`, `issuer` and `type`!" });
  } else if (!provider) {
    res.status(403).json({ error: "We don't accept logins from OAuth provider " + type + "/" + issuer });
  } else {
    try {
      const client = await findOAuthClient(provider);
      const tokenSet = await client.callback(OAuthSettings.REDIRECT_URI, client.callbackParams(req));
      // TODO: Differentiate between being not authorized (403 error) and e.g. connection issues to OAuth server (502 error)
      const userInfo = await client.userinfo(tokenSet, { method: "POST", via: "body" });
      const dbUser = await AppDataSource.manager.getRepository(OAuthAccountEntity).findOne({
        where: {
          type: type,
          domain: issuer,
          oauthId: userInfo.sub,
        },
        relations: ["user"],
      });

      if (tokenSet.id_token) {
        const firstName = dbUser?.user?.firstName ?? userInfo.given_name;
        const lastName = dbUser?.user?.lastName ?? userInfo.family_name;
        const username =
          dbUser?.user?.username ??
          userInfo.nickname ??
          userInfo.preferred_username ??
          [firstName, lastName].filter(isNotNull).join(".").replace(" ", ".").toLowerCase();
        const result: OAuthUserInfoDto = {
          token: {
            id_token: tokenSet.id_token,
            type: provider.type,
            issuer: provider.domain,
          },
          oauthId: userInfo.sub,
          user: {
            firstName,
            lastName,
            email: dbUser?.user?.email ?? userInfo.email,
            profilePicture: dbUser?.user?.profilePicture,
            username,
          },
          isExisting: !!dbUser,
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
    } catch (e) {
      res.status(403).json({ error: "Failed to get the token! " + e });
    }
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
