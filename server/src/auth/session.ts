import { TokenSet, UserinfoResponse } from "openid-client";
import { fromBase64, toBase64 } from "../utils.js";

/**
 * The user session.
 * @property {TokenSet} tokenSet The collection of tokens and the meta info
 * associated with them created and supplied by the authentication provider
 */
export interface ISession {
  user: UserinfoResponse;
  tokenSet: TokenSet;
}

export function toString(session: ISession): string {
  return toBase64(session);
}

export function fromString(value: string): ISession {
  const raw: ISession = fromBase64<ISession>(value);
  return {
    ...raw,
    tokenSet: new TokenSet(raw.tokenSet)
  };
}
