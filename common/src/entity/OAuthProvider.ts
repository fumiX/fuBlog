import { OAuthProviderId, OAuthType } from "@common/dto/oauth/OAuthType.js";

type AuthorizationParameters = {
  response_type: string;
  scope?: string;
  access_type?: string;
};

export abstract class OAuthProvider<T extends OAuthType> {
  public readonly index: number;
  public readonly type: T;
  public readonly domain: string;
  public readonly clientId: string;
  public readonly clientSecret: string;

  public getIdTokenSignedResponseAlg(): "HS256" | "RS256" {
    return "RS256";
  }

  public getAuthorizeQueryParams(): AuthorizationParameters {
    return {
      access_type: "online",
      response_type: "code",
      scope: "email openid profile",
    };
  }

  protected constructor(index: number, type: T, clientId: string, clientSecret: string, domain: string) {
    this.index = index;
    this.type = type;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.domain = domain;
  }

  public getIdentifier(): OAuthProviderId {
    return `${this.type}/${this.domain}`;
  }
}

export class FakeOAuthProvider extends OAuthProvider<"FAKE"> {
  constructor(index = 0, clientId?: string | undefined, clientSecret?: string | undefined, domain?: string | undefined, https?: boolean) {
    super(index, "FAKE", clientId ?? "ID", clientSecret ?? "secret", domain ?? "localhost:5030");
  }

  public getIdTokenSignedResponseAlg(): "HS256" {
    return "HS256";
  }
}

export class GitlabOAuthProvider extends OAuthProvider<"GITLAB"> {
  constructor(index: number, clientId: string, clientSecret: string, domain: string | undefined) {
    super(index, "GITLAB", clientId, clientSecret, domain ?? "gitlab.com");
  }
}

export class GoogleOAuthProvider extends OAuthProvider<"GOOGLE"> {
  constructor(index: number, clientId: string, clientSecret: string, domain: string | undefined) {
    super(index, "GOOGLE", clientId, clientSecret, domain ?? "accounts.google.com");
  }
}
