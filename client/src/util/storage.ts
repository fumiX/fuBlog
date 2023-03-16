import { isOAuthType, OAUTH_TYPES } from "@fumix/fu-blog-common";
import type { OAuthType } from "@fumix/fu-blog-common";
import type { SavedOAuthToken } from "@fumix/fu-blog-common";

type OAuthState = { key: string; redirect_uri?: string };
const idTokenKey = "id_token";
const oauthTypeKey = "oauth_type";
const oauthIssuerKey = "oauth_issuer";
const recentOauthStatesKey = "recent_oauth_states";
export function saveOauthState(state: OAuthState) {
  const prevStates = loadFromStorageAsJson<OAuthState[]>(window.sessionStorage, recentOauthStatesKey, []);
  const newStates = [state];
  newStates.push(...prevStates);
  saveToStorageAsJson<OAuthState[]>(window.sessionStorage, recentOauthStatesKey, newStates.length > 10 ? newStates.slice(0, 9) : newStates);
}

export function loadOauthStateByKey(key: string | undefined | null): OAuthState | undefined {
  return loadFromStorageAsJson<OAuthState[]>(window.sessionStorage, recentOauthStatesKey, []).find((it) => it.key === key);
}

export function saveIdToken(token: SavedOAuthToken): void {
  saveToStorageAsString(window.localStorage, idTokenKey, token.id_token);
  saveToStorageAsString(window.localStorage, oauthTypeKey, token.type);
  saveToStorageAsString(window.localStorage, oauthIssuerKey, token.issuer);
}

export function loadIdToken(): SavedOAuthToken | undefined {
  const id_token = loadFromStorageAsStringOrUndefined(window.localStorage, idTokenKey);
  const type = loadFromStorageAsStringOrUndefined(window.localStorage, oauthTypeKey);
  const issuer = loadFromStorageAsStringOrUndefined(window.localStorage, oauthIssuerKey);
  if (id_token && isOAuthType(type) && issuer) {
    return {
      id_token,
      type,
      issuer,
    };
  } else {
    return undefined;
  }
}

//
// General purpose helper functions, should only be called indirectly
//

/**
 * Saves the given `value` to the given storage for the given `key`.
 */
function saveToStorageAsString(storage: Storage, key: string, value: string): void {
  storage.setItem(key, value);
}

/**
 * Applies `JSON.stringify()` to the given `value` and saves that JSON to the given `storage` for the given `key`.
 */
function saveToStorageAsJson<T>(storage: Storage, key: string, value: T): void {
  saveToStorageAsString(storage, key, JSON.stringify(value));
}

/**
 * Loads a value for the given `key` from the given `storage` by parsing the saved value with `JSON.parse` to the generic type `T`.
 * If there is no value saved for the `key`, or it can't be converted to type `T`, then `undefined` is returned.
 */
function loadFromStorageAsJsonOrUndefined<T>(storage: Storage, key: string): T | undefined {
  return loadFromStorageAsJson<T | undefined>(storage, key, undefined);
}

/**
 * Loads a value for the given `key` from the given `storage` by parsing the saved value with `JSON.parse` to the generic type `T`.
 * If there is no value saved for the `key`, or it can't be converted to type `T`, then the given `defaultValue` is returned.
 */
function loadFromStorageAsJson<T>(storage: Storage, key: string, defaultValue: T): T {
  return loadFromStorage<T>(storage, key, (it) => JSON.parse(it) as T, defaultValue);
}

/**
 * Load a string value directly from the given `storage`, as is. Returns `undefined`, if no value is present for the `key`.
 */
function loadFromStorageAsStringOrUndefined(storage: Storage, key: string): string | undefined {
  return loadFromStorage<string | undefined>(storage, key, (it) => it, undefined);
}

/**
 * Load a string value directly from the given `storage`, as is. Falling back to a given `defaultValue`, if no value is present for the `key`.
 */
function loadFromStorageAsString(storage: Storage, key: string, defaultValue: string): string {
  return loadFromStorage<string>(storage, key, (it) => it, defaultValue);
}

function loadFromStorage<T>(storage: Storage, key: string, stringToValue: (storedValue: string) => T | null, defaultValue: T) {
  const storedValue: string | null = storage.getItem(key);
  if (storedValue !== null) {
    const parsedValue: T | null = stringToValue(storedValue);
    if (parsedValue !== null) {
      return parsedValue;
    }
  }
  return defaultValue;
}
