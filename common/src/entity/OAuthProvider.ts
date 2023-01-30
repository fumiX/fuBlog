export abstract class OAuthProvider {
  public readonly type: string;
  public readonly domain: string;
  public readonly authorizePath: string;
  public readonly tokenUrl: string;
  public readonly clientId: string;
  public readonly clientSecret: string;
  public readonly https: boolean;

  protected getAuthorizeQueryParams(): { [key: string]: string } {
    return { response_type: "code" };
  }

  protected constructor(clientId: string, clientSecret: string, domain: string, https: boolean) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.domain = domain;
    this.https = https;
  }

  public getAuthorizeUrl(redirectURI: string, state: string): string {
    return (
      `${this.https ? "https" : "http"}://${this.domain}${this.authorizePath}?` +
      buildQueryString({
        ...this.getAuthorizeQueryParams(),
        ...{
          client_id: this.clientId,
          state,
          redirect_uri: redirectURI,
        },
      })
    );
    /*return clientId=${encodeURIComponent(
      this.clientId,
    )}&clientSecret=${encodeURIComponent(this.clientSecret)}&state=${encodeURIComponent(state)}`;*/
  }
}

function buildQueryString(keyvalues: { [key: string]: string }): string {
  return Object.entries(keyvalues)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .sort()
    .join("&");
}

export class FakeOAuthProvider extends OAuthProvider {
  public static readonly TYPE = "FAKE";
  type = FakeOAuthProvider.TYPE;
  authorizePath = "/authorize";

  constructor(clientId?: string | undefined, clientSecret?: string | undefined, domain?: string | undefined, https?: boolean) {
    super(clientId ?? "ID", clientSecret ?? "secret", domain ?? "localhost:5030", https ?? false);
  }
}

export class GitlabOAuthProvider extends OAuthProvider {
  public static TYPE = "GITLAB";
  type = GitlabOAuthProvider.TYPE;
  authorizePath = "/oauth/authorize";

  constructor(clientId: string, clientSecret: string, domain: string | undefined) {
    super(clientId, clientSecret, domain ?? "gitlab.com", true);
  }

  protected getAuthorizeQueryParams(): { [p: string]: string } {
    return {
      ...super.getAuthorizeQueryParams(),
      scope: "profile email",
    };
  }
}

export class GoogleOAuthProvider extends OAuthProvider {
  public static TYPE = "GOOGLE";
  type = GoogleOAuthProvider.TYPE;
  authorizePath = "/o/oauth2/v2/auth";
  tokenUrl = "https://oauth2.googleapis.com/token";

  constructor(clientId: string, clientSecret: string, domain: string | undefined) {
    super(clientId, clientSecret, domain ?? "accounts.google.com", true);
  }

  protected getAuthorizeQueryParams(): { [key: string]: string } {
    return {
      ...super.getAuthorizeQueryParams(),
      ...{
        scope: "openid email",
        access_type: "online",
      },
    };
  }
}
