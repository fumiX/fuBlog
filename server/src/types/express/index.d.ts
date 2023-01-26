import { Client, Issuer } from "openid-client";
import { ISession } from "../../auth/session.js";

declare global {
  namespace Express {
    export interface Application {
      authIssuer?: Issuer;
      authClient?: Client;
      codeVerifier?: string;
    }
    export interface Request {
      session?: ISession;
    }
  }
}
