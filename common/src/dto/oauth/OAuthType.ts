export const OAUTH_TYPES = <const>["FAKE", "GITLAB", "GOOGLE"];
export type OAuthType = (typeof OAUTH_TYPES)[number];

export type OAuthProviderId = `${OAuthType}/${string}`;

export function isOAuthType(s: string | undefined | null): s is OAuthType {
  return !!OAUTH_TYPES.find((it) => it === s);
}
