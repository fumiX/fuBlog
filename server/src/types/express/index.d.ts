import { OAuthAccountEntity } from "@server/entity/OAuthAccount.entity.js";
import { Client, Issuer } from "openid-client";

declare global {
  namespace Express {
    export interface Application {
      authIssuer?: Issuer;
      authClient?: Client;
      codeVerifier?: string;
    }
    export interface Request {
      loggedInUser?: () => Promise<OAuthAccountEntity | undefined | null>;
    }
  }
}
