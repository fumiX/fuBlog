import { OAuthType } from "@/dto/oauth/OAuthType.js";

type AuthorizationParameters = {
  response_type?: string;
  scope?: string;
  access_type?: string;
};

export abstract class OAuthProvider {
  public readonly type: OAuthType;
  public readonly domain: string;
  public readonly authorizePath: string;
  public readonly tokenUrl: string;
  public readonly clientId: string;
  public readonly clientSecret: string;
  public readonly https: boolean;

  public getIdTokenSignedResponseAlg(): "HS256" | "RS256" {
    return "RS256";
  }

  public getAuthorizeQueryParams(): Partial<AuthorizationParameters> {
    return { response_type: "code" };
  }

  protected constructor(type: OAuthType, clientId: string, clientSecret: string, domain: string, https: boolean) {
    this.type = type;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.domain = domain;
    this.https = https;
    console.log(`Loaded OAuth provider ${this.getIdentifier()}`);
  }

  public getIdentifier(): string {
    return `${this.type}/${this.domain}`;
  }
}

export class FakeOAuthProvider extends OAuthProvider {
  authorizePath = "/authorize";

  constructor(clientId?: string | undefined, clientSecret?: string | undefined, domain?: string | undefined, https?: boolean) {
    super("FAKE", clientId ?? "ID", clientSecret ?? "secret", domain ?? "localhost:5030", https ?? false);
  }

  public getIdTokenSignedResponseAlg(): "HS256" {
    return "HS256";
  }
}

export class GitlabOAuthProvider extends OAuthProvider {
  authorizePath = "/oauth/authorize";

  constructor(clientId: string, clientSecret: string, domain: string | undefined) {
    super("GITLAB", clientId, clientSecret, domain ?? "gitlab.com", true);
  }

  public getAuthorizeQueryParams(): AuthorizationParameters {
    return {
      ...super.getAuthorizeQueryParams(),
      scope: "profile email",
    };
  }
}

export class GoogleOAuthProvider extends OAuthProvider {
  authorizePath = "/o/oauth2/v2/auth";
  tokenUrl = "https://oauth2.googleapis.com/token";

  constructor(clientId: string, clientSecret: string, domain: string | undefined) {
    super("GOOGLE", clientId, clientSecret, domain ?? "accounts.google.com", true);
  }

  public getAuthorizeQueryParams(): AuthorizationParameters {
    return {
      ...super.getAuthorizeQueryParams(),
      ...{
        scope: "openid email profile",
        access_type: "online",
      },
    };
  }
}
