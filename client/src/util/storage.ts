import type { JsonWebToken, SavedOAuthToken, UserTheme } from "@fumix/fu-blog-common";
import { base64UrlToBuffer, isOAuthType, isUserTheme } from "@fumix/fu-blog-common";

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

export function saveIdToken(token: SavedOAuthToken | null): void {
  if (token) {
    logIdTokenValidity(token.id_token);
    saveToStorageAsString(window.localStorage, idTokenKey, token.id_token);
    saveToStorageAsString(window.localStorage, oauthTypeKey, token.type);
    saveToStorageAsString(window.localStorage, oauthIssuerKey, token.issuer);
  } else {
    removeKeyFromStorage(window.localStorage, idTokenKey);
    removeKeyFromStorage(window.localStorage, oauthTypeKey);
    removeKeyFromStorage(window.localStorage, oauthIssuerKey);
  }
  window.dispatchEvent(new CustomEvent("token-changed", { detail: token }));
}

export function updateIdToken(idToken: JsonWebToken | null): void {
  if (idToken) {
    logIdTokenValidity(idToken);
    saveToStorageAsString(window.localStorage, idTokenKey, idToken);
  } else {
    removeKeyFromStorage(window.localStorage, idTokenKey);
  }
}

function logIdTokenValidity(idToken: JsonWebToken): void {
  const payload = idToken.split(".", 3)[1];
  if (payload) {
    console.debug("New ID token saved, valid until ", new Date(1000 * JSON.parse(base64UrlToBuffer(payload).toString("utf-8"))["exp"]));
  }
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

export function saveCssPreference(css: UserTheme) {
  saveToStorageAsString(window.localStorage, "cssTheme", css);
}

export function loadCssPreference(): UserTheme {
  return loadFromStorage(
    window.localStorage,
    "cssTheme",
    (saved) => {
      if (isUserTheme(saved)) {
        return saved;
      }
      return null;
    },
    "light",
  );
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

function removeKeyFromStorage(storage: Storage, key: string): void {
  storage.removeItem(key);
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
