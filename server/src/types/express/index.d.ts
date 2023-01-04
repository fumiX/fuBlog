import { Client, Issuer } from "openid-client";

declare global {
  namespace Express {
    export interface Application {
      authIssuer?: Issuer;
      authClient?: Client;
      codeVerifier?: string;
    }
  }
}
