import { OAuthType } from "@/dto/oauth/OAuthType.js";
import { AuthorizationParameters, Client, Issuer } from "openid-client";

export abstract class OAuthProvider {
  public readonly type: OAuthType;
  public readonly domain: string;
  public readonly authorizePath: string;
  public readonly tokenUrl: string;
  public readonly clientId: string;
  public readonly clientSecret: string;
  public readonly https: boolean;
  public readonly client: Promise<Client | null>;

  protected getAuthorizeQueryParams(): Partial<AuthorizationParameters> {
    return { response_type: "code" };
  }

  protected constructor(type: OAuthType, clientId: string, clientSecret: string, domain: string, https: boolean) {
    this.type = type;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.domain = domain;
    this.https = https;
    this.client = Issuer.discover(`https://${domain}`)
      .then((issuer) => {
        return new issuer.Client({
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uris: ["http://localhost:5010/auth"],
        });
      })
      .catch((reason) => {
        console.error("Failed to initialize OAuth client: ", reason);
        return null;
      });
    console.log(`Initialized OAuth provider ${this.type}/${domain}`);
  }

  public async getAuthorizationUrl(redirect_uri: string, state: string): Promise<string | undefined> {
    return this.client.then((client) =>
      client?.authorizationUrl({
        ...this.getAuthorizeQueryParams(),
        ...{ client_id: this.clientId, redirect_uri, state },
      }),
    );
  }
}

export class FakeOAuthProvider extends OAuthProvider {
  authorizePath = "/authorize";

  constructor(clientId?: string | undefined, clientSecret?: string | undefined, domain?: string | undefined, https?: boolean) {
    super("FAKE", clientId ?? "ID", clientSecret ?? "secret", domain ?? "localhost:5030", https ?? false);
  }
}

export class GitlabOAuthProvider extends OAuthProvider {
  authorizePath = "/oauth/authorize";

  constructor(clientId: string, clientSecret: string, domain: string | undefined) {
    super("GITLAB", clientId, clientSecret, domain ?? "gitlab.com", true);
  }

  protected getAuthorizeQueryParams(): AuthorizationParameters {
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

  protected getAuthorizeQueryParams(): AuthorizationParameters {
    return {
      ...super.getAuthorizeQueryParams(),
      ...{
        scope: "openid email",
        access_type: "online",
      },
    };
  }
}
