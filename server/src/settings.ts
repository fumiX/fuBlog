import { OAUTH_TYPES, OAuthProvider, OAuthType } from "@fumix/fu-blog-common";
import { isOAuthType } from "@fumix/fu-blog-common";
import { loadOAuthProvidersFromEnv } from "./load-oauth-providers-from-env.js";

export class AppSettings {
  static readonly IS_PRODUCTION = process.env.NODE_ENV !== "development";
  static readonly RUN_MODE: "development" | "production" = AppSettings.IS_PRODUCTION ? "production" : "development";
}

export class ClientSettings {
  static readonly PORT: number = toNumberOrDefault(process.env.CLIENT_PORT, 5010);
  static readonly BASE_URL: string = process.env.CLIENT_BASE_URL ?? `http://localhost:${ClientSettings.PORT}`;
}

export class DatabaseSettings {
  static readonly HOST: string = process.env.DATABASE_HOST ?? "localhost";
  static readonly PORT: number = toNumberOrDefault(process.env.DATABASE_PORT, 5020);
  static readonly USER: string = process.env.DATABASE_USER ?? "fublog";
  static readonly PASSWORD: string = process.env.DATABASE_PASSWORD ?? "8!06";
  static readonly NAME: string = process.env.DATABASE_NAME ?? "fublog";
}

export class ServerSettings {
  static readonly API_PATH: string = process.env.SERVER_API_PATH ?? "/api";
  static readonly HOST: string = process.env.SERVER_HOST ?? "localhost";
  static readonly PORT: number = toNumberOrDefault(process.env.SERVER_PORT, 5000);
  static readonly PROTOCOL: "http" | "https" = AppSettings.IS_PRODUCTION ? "https" : "http";
}

export class OAuthSettings {
  /**
   * This is intended to be used to bootstrap the first user account.
   * When a user with the given email address logs in via the given OAuthType and issuer domain, then that user gets the admin role.
   * Set all three environment variables `OAUTH_ADMIN_EMAIL`, `OAUTH_ADMIN_ISSUER` and `OAUTH_ADMIN_TYPE` until the first user is created.
   * Then unset the environment variables again.
   */
  static readonly ADMIN_LOGIN: { email: string; oauthIssuer: string; oauthType: OAuthType } | undefined = ((
    email,
    oauthIssuer,
    oauthType,
  ) => {
    if (!email && !oauthIssuer && !oauthType) {
      return undefined;
    } else if (!email || !oauthIssuer || !oauthType) {
      throw new Error(
        "One or more of the environment variables `OAUTH_ADMIN_EMAIL`, `OAUTH_ADMIN_ISSUER` and `OAUTH_ADMIN_TYPE` is not set! Set either all of them or none.",
      );
    } else if (!email.includes("@") || oauthIssuer.includes("/") || !isOAuthType(oauthType)) {
      throw new Error(
        "Invalid format for one (or both) of the environment variables " +
          "`OAUTH_ADMIN_EMAIL` (must contain an `@`), " +
          "`OAUTH_ADMIN_ISSUER` (must not contain a `/`) " +
          `or \`OAUTH_ADMIN_TYPE\` (must be one of \`${OAUTH_TYPES.join("`, `")}\`)!`,
      );
    } else {
      return {
        email,
        oauthIssuer,
        oauthType,
      };
    }
  })(process.env.OAUTH_ADMIN_EMAIL, process.env.OAUTH_ADMIN_ISSUER, process.env.OAUTH_ADMIN_TYPE);
  static readonly REDIRECT_URI = process.env.OAUTH_REDIRECT_URI ?? ClientSettings.BASE_URL + "/login";
  static readonly PROVIDERS: OAuthProvider<OAuthType>[] = loadOAuthProvidersFromEnv();

  static findByType<T extends OAuthType>(type: T): OAuthProvider<T>[] {
    return OAuthSettings.PROVIDERS.filter<OAuthProvider<T>>((it: OAuthProvider<OAuthType>): it is OAuthProvider<T> => {
      return it.type === type;
    });
  }

  static findByTypeAndDomain<T extends OAuthType>(type: T, domain: string): OAuthProvider<T> | undefined {
    return this.findByType(type).find((it) => it.domain === domain);
  }
}

function toNumberOrDefault(value: string | undefined | null, defaultValue: number): number {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  return Number(value);
}
