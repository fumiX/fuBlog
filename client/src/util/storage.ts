type OAuthState = { key: string; redirect_uri?: string };
const idTokenKey = "id_token";
const recentOauthStatesKey = "recent_oauth_states";
export function saveOauthState(state: OAuthState) {
  const prevStates = loadFromStorage<OAuthState[]>(window.sessionStorage, recentOauthStatesKey, []);
  const newStates = [state];
  newStates.push(...prevStates);
  saveToStorage<OAuthState[]>(window.sessionStorage, recentOauthStatesKey, newStates.length > 10 ? newStates.slice(0, 9) : newStates);
}

export function loadOauthStateByKey(key: string | undefined | null): OAuthState | undefined {
  return loadFromStorage<OAuthState[]>(window.sessionStorage, recentOauthStatesKey, []).find((it) => it.key === key);
}

export function saveIdToken(token: string) {
  saveToStorage<string>(window.localStorage, idTokenKey, token);
}

export function loadIdToken(): string | undefined {
  return loadFromStorageOrUndefined<string>(window.localStorage, idTokenKey);
}

/*
 * General purpose helper functions, should only be called indirectly
 */

function saveToStorage<T>(storage: Storage, key: string, value: T) {
  storage.setItem(key, JSON.stringify(value));
}

function loadFromStorageOrUndefined<T>(storage: Storage, key: string): T | undefined {
  return loadFromStorage<T | undefined>(storage, key, undefined);
}

function loadFromStorage<T>(storage: Storage, key: string, defaultValue: T): T {
  const storedValue: string | null = storage.getItem(key);
  if (storedValue !== null) {
    const parsedValue: T | null = JSON.parse(storedValue) as T;
    if (parsedValue !== null) {
      return parsedValue;
    }
  }
  return defaultValue;
}
