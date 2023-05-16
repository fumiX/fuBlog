import { Cookies, HttpHeader, OAuthProvider, OAuthType } from "@fumix/fu-blog-common";
import { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, JWTPayload, jwtVerify } from "jose";
import { AppDataSource } from "../../data-source.js";
import { OAuthAccountEntity } from "../../entity/OAuthAccount.entity.js";
import logger from "../../logger.js";
import { findOAuthClient } from "../../routes/auth.js";
import { OAuthSettings } from "../../settings.js";

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authorizationHeaderValue = req.header("Authorization");
  const jwtToken = authorizationHeaderValue?.startsWith("Bearer ") ? authorizationHeaderValue.substring(7) : undefined;
  const oauthType: OAuthType | undefined = req.header(HttpHeader.Request.OAUTH_TYPE) as OAuthType;
  const oauthIssuer = req.header(HttpHeader.Request.OAUTH_ISSUER);
  const refreshToken = Cookies.getCookies(req)["refresh"];

  if (jwtToken && oauthType && oauthIssuer) {
    const provider = OAuthSettings.findByTypeAndDomain(oauthType, oauthIssuer);
    if (provider) {
      const refreshTokenFun: (oldToken: string) => Promise<string> = async (oldToken) => {
        const client = await findOAuthClient(provider);
        logger.debug("Refreshing a token …");
        if (refreshToken) {
          const tokenSet = await client.refresh(refreshToken).catch(() => undefined);
          Cookies.setRefreshTokenCookie(res, tokenSet?.refresh_token);
          res.header(HttpHeader.Response.OAUTH_REFRESHED_ID_TOKEN, tokenSet?.id_token);
          return tokenSet?.id_token ? tokenSet.id_token : Promise.reject();
        }
        return Promise.reject();
      };

      req.loggedInUser = async () =>
        checkIdToken(jwtToken, provider, refreshTokenFun)
          .then<OAuthAccountEntity | null>((it) => {
            logger.debug(`ID token checked, ${it.exp ? "expires at " + new Date(it.exp * 1000) : "expired"}`);
            return AppDataSource.manager //
              .getRepository(OAuthAccountEntity)
              .findOne({ where: { oauthId: it.sub }, relations: ["user"] });
          })
          .then((it) => it ?? undefined)
          .catch((x) => undefined);
    }
  }
  next();
};

export async function checkIdToken(
  id_token: string,
  provider: OAuthProvider<OAuthType>,
  refreshFun: (id_token: string) => Promise<string> = () => Promise.reject("Don't refresh by default"),
): Promise<JWTPayload> {
  const refresh = () =>
    refreshFun(id_token)
      .then((it) => checkIdToken(it, provider))
      .catch(() => Promise.reject("Failed to refresh ID token!"));
  if (provider?.type === "FAKE") {
    try {
      const result = await jwtVerify(id_token, new TextEncoder().encode("secret"));
      if (result?.payload?.sub) {
        return result.payload;
      }
    } catch (e) {
      return refresh();
    }
  } else if (provider?.type === "GOOGLE") {
    const jwks = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
    try {
      const result = await jwtVerify(id_token, jwks);
      if (result?.payload?.sub) {
        return result.payload;
      }
    } catch (e) {
      return refresh();
    }
  } else if (provider?.type === "GITLAB") {
    const jwks = createRemoteJWKSet(new URL(`https://${provider.domain}/oauth/discovery/keys`));
    try {
      const result = await jwtVerify(id_token, jwks);
      if (result?.payload?.sub) {
        return result.payload;
      }
    } catch (e) {
      return refresh();
    }
  }
  return Promise.reject("Could not verify ID token");
}

export { authMiddleware };
