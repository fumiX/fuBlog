import { OAuthProvider, OAuthType } from "@fumix/fu-blog-common";
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
  static readonly CLIENT_ID = "";
  static readonly CLIENT_SECRET = "";
  static readonly PROVIDER_URL = "";
  static readonly PROVIDERS: OAuthProvider[] = loadOAuthProvidersFromEnv();

  static findByType(type: OAuthType): OAuthProvider[] {
    return OAuthSettings.PROVIDERS.filter((it) => it.type === type);
  }
  static findByTypeAndDomain(type: OAuthType, domain: string): OAuthProvider | undefined {
    return this.findByType(type).find((it) => it.domain === domain);
  }
}

function toNumberOrDefault(value: string | undefined | null, defaultValue: number): number {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  return Number(value);
}
