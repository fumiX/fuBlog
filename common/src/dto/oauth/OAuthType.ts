export const OAUTH_TYPES = <const>["FAKE", "GITLAB", "GOOGLE"];
export type OAuthType = (typeof OAUTH_TYPES)[number];

export function isOAuthType(s: string | undefined): s is OAuthType {
  return !!OAUTH_TYPES.find((it) => it === s);
}
