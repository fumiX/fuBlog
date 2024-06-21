import { OAuthAccountEntity } from "@server/entity/OAuthAccount.entity.js";
import { LoggedInUserInfo } from "@server/service/middleware/auth.js";
import { Client, Issuer } from "openid-client";

declare global {
  namespace Express {
    export interface Application {
      authIssuer?: Issuer;
      authClient?: Client;
      codeVerifier?: string;
    }
    export interface Request {
      /**
       * Get the logged-in user by using `req.loggedInUser?.()`
       */
      loggedInUser?: () => Promise<LoggedInUserInfo | undefined>;
    }
  }
}
