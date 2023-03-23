import {
  bytesToDataUrl,
  convertToUsername,
  DataUrl,
  isNeitherNullNorUndefined,
  OAuthProvider,
  OAuthProviderId,
  OAuthProvidersDto,
  OAuthType,
  OAuthUserInfoDto,
  SavedOAuthToken,
  UserInfoOAuthToken,
} from "@fumix/fu-blog-common";
import console from "console";
import express, { Request, Response, Router } from "express";
import { createRemoteJWKSet, JWTPayload, jwtVerify } from "jose";
import fetch from "node-fetch";
import { BaseClient, Issuer, TokenSet } from "openid-client";
import { AppDataSource } from "../data-source.js";
import { OAuthAccountEntity } from "../entity/OAuthAccount.entity.js";
import { UserEntity } from "../entity/User.entity.js";
import { findOAuthAccountBy } from "../service/crud.js";
import { OAuthSettings } from "../settings.js";

const router: Router = express.Router();

enum StatusCode {
  Unauthorized = 401,
}

const oauthClients: { [provider in OAuthProviderId]: BaseClient | undefined } = {};
OAuthSettings.PROVIDERS.forEach((p) => {
  oauthClients[p.getIdentifier()] = undefined;
});

async function findOAuthClient(provider: OAuthProvider<OAuthType>): Promise<BaseClient> {
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
      ).filter(isNeitherNullNorUndefined),
    };
    res.status(200).json(result);
  }
});

async function getAuthorizationUrl(
  oauthProvider: OAuthProvider<OAuthType>,
  redirect_uri: string,
  state: string,
): Promise<string | undefined> {
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

async function checkIdToken(id_token: string, provider: OAuthProvider<OAuthType>): Promise<JWTPayload> {
  if (provider?.type === "FAKE") {
    const result = await jwtVerify(id_token, new TextEncoder().encode("secret"));
    if (result?.payload?.sub) {
      return result.payload;
    }
  } else if (provider?.type === "GOOGLE") {
    const jwks = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
    const result = await jwtVerify(id_token, jwks);
    if (result?.payload?.sub) {
      return result.payload;
    }
  } else if (provider?.type === "GITLAB") {
    const jwks = createRemoteJWKSet(new URL(`https://${provider.domain}/oauth/discovery/keys`));
    const result = await jwtVerify(id_token, jwks);
    if (result?.payload?.sub) {
      return result.payload;
    }
  }
  return Promise.reject();
}

router.post("/loggedInUser", async (req, res) => {
  const savedToken = req.body as SavedOAuthToken;

  if (!savedToken) {
    res.status(400).json("Error: Can't decode body to SavedOAuthToken!");
  } else {
    const provider = OAuthSettings.findByTypeAndDomain(savedToken.type, savedToken.issuer);
    if (provider) {
      await checkIdToken(savedToken.id_token, provider)
        .then(async (payload) => {
          if (payload.sub) {
            const account = await findOAuthAccountBy(payload.sub, provider);
            if (account) {
              res.status(200).json(account);
            }
          }
        })
        .catch(() => {
          res.status(403).json({ error: "Unauthorized" });
        });
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

      if (tokenSet.id_token && tokenSet.access_token) {
        const fullName =
          dbUser?.user?.fullName ??
          userInfo.name ??
          [userInfo.given_name, userInfo.middle_name, userInfo.family_name].filter(isNeitherNullNorUndefined).join(" ");
        const username = dbUser?.user?.username ?? convertToUsername(userInfo.nickname ?? userInfo.preferred_username ?? fullName);
        const email = dbUser?.user?.email ?? userInfo.email;
        if (!email) {
          console.error("Did not receive an email address for new user!");
          res.status(403);
          return;
        }
        const result: OAuthUserInfoDto = {
          token: {
            access_token: tokenSet.access_token,
            id_token: tokenSet.id_token,
            type: provider.type,
            issuer: provider.domain,
          },
          oauthId: userInfo.sub,
          user: {
            fullName,
            email,
            profilePictureUrl: dbUser?.user?.profilePictureUrl,
            username,
          },
          isExisting: !!dbUser,
        };
        if (!result.user.profilePictureUrl && userInfo.picture) {
          try {
            result.user.profilePictureUrl = await (
              await fetch(userInfo.picture)
            )
              .blob()
              .then<DataUrl>(async (it) => bytesToDataUrl(it.type, new Uint8Array(await it.arrayBuffer())))
              .catch(() => undefined);
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

router.post("/userinfo/register", async (req, res) => {
  const fullName = req.body.fullName ?? "";
  const username = req.body.username;
  const savedToken = req.body.savedToken as UserInfoOAuthToken;
  if (!savedToken) {
    res.status(403).json({ error: "Unauthorized!" });
  } else if (!username || username.length < 3 || username.length > 64) {
    res.status(400).json({ error: "A username with length between 3 and 64 is required!" });
  } else {
    const provider = OAuthSettings.findByTypeAndDomain(savedToken.type, savedToken.issuer);
    if (!provider) {
      res.status(400).json({ error: "Invalid provider " + savedToken.type + "/" + savedToken.issuer });
    } else {
      await checkIdToken(savedToken.id_token, provider)
        .then(async (it) => {
          const oauthUserId = it.sub;
          if (oauthUserId) {
            const client = await findOAuthClient(provider);
            const tokenSet = new TokenSet({ id_token: savedToken.id_token, access_token: savedToken.access_token });
            const userInfo = await client.userinfo(tokenSet, { method: "POST", via: "body" });
            const userEmail = userInfo.email;
            if (!userEmail) {
              res.status(502).json({ error: "Could not retrieve email address!" });
            } else {
              const user: UserEntity = {
                isActive: true,
                fullName,
                username,
                roles:
                  OAuthSettings.ADMIN_LOGIN?.email === userEmail &&
                  OAuthSettings.ADMIN_LOGIN?.oauthIssuer === provider.domain &&
                  OAuthSettings.ADMIN_LOGIN.oauthType === provider.type &&
                  (await AppDataSource.manager.getRepository(UserEntity).count()) <= 0
                    ? ["ADMIN"]
                    : [],
                email: userEmail,
              };
              AppDataSource.manager
                .transaction(async (mgr) => {
                  await mgr.insert(UserEntity, [user]).then((it) => console.log("New user created ", user));
                  const oauthAccount: OAuthAccountEntity = {
                    type: provider.type,
                    domain: provider.domain,
                    oauthId: oauthUserId,
                    user,
                  };
                  await mgr.insert(OAuthAccountEntity, [oauthAccount]).then((it) => console.log("New OAuth account created", oauthAccount));
                })
                .then(async () => {
                  const result: OAuthUserInfoDto = {
                    isExisting: true,
                    token: savedToken,
                    oauthId: oauthUserId,
                    user,
                  };

                  res.status(200).json(result);
                })
                .catch(() => res.status(403).json({ error: "Unauthorized" }));
            }
          }
        })
        .catch((err) => {
          console.log("Error", err);
          res.status(403).json({ error: "Unauthorized" });
        });
    }
  }
});

export default router;
