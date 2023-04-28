import { OAuthProvider, OAuthType } from "@fumix/fu-blog-common";
import { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, JWTPayload, jwtVerify } from "jose";
import { AppDataSource } from "../../data-source.js";
import { OAuthAccountEntity } from "../../entity/OAuthAccount.entity.js";
import { OAuthSettings } from "../../settings.js";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authorizationHeaderValue = req.header("Authorization");
  const jwtToken = authorizationHeaderValue?.startsWith("Bearer ") ? authorizationHeaderValue.substring(7) : undefined;
  const oauthType = req.header("X-OAuth-Type") as OAuthType;
  const oauthIssuer = req.header("X-OAuth-Issuer");

  if (jwtToken && oauthType && oauthIssuer) {
    const provider = OAuthSettings.findByTypeAndDomain(oauthType, oauthIssuer);
    if (provider) {
      req.loggedInUser = async () =>
        checkIdToken(jwtToken, provider)
          .then((it) => {
            return AppDataSource.manager //
              .getRepository(OAuthAccountEntity)
              .findOne({ where: { oauthId: it.sub }, relations: ["user"] });
          })
          .then((it) => {
            if (it) {
              return it;
            }
            return undefined;
          })
          .catch(() => undefined);
    }
  }
  next();
};

export async function checkIdToken(id_token: string, provider: OAuthProvider<OAuthType>): Promise<JWTPayload> {
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
  return Promise.reject("Could not verify ");
}

export { authMiddleware };
