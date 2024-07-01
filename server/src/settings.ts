import { AppSettingsDto, asHyperlinkDto, isOAuthType, OAUTH_TYPES, OAuthProvider, OAuthType } from "@fumix/fu-blog-common";
import { createTransport } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport/index.js";
import { LeveledLogMethod } from "winston";
import logger from "./logger.js";
import console from "console";
import { readFileSync } from "fs";
import path, { dirname } from "path";
import * as process from "process";
import { fileURLToPath } from "url";
import { loadOAuthProvidersFromEnv } from "./load-oauth-providers-from-env.js";

export class AppSettings {
  static readonly IS_PRODUCTION = process.env.NODE_ENV !== "development";
  static readonly RUN_MODE: "development" | "production" = AppSettings.IS_PRODUCTION ? "production" : "development";
  static readonly IMPRINT_LABEL: string | undefined = process.env.APP_IMPRINT_LABEL;
  static readonly IMPRINT_URL: string | undefined = process.env.APP_IMPRINT_URL;
  static readonly GITHUB_REPOSITORY_SLUG: string | undefined = process.env.APP_GITHUB_REPOSITORY_SLUG;
  static readonly MAIN_WEBSITE_LABEL: string | undefined = process.env.APP_MAIN_WEBSITE_LABEL;
  static readonly MAIN_WEBSITE_URL: string | undefined = process.env.APP_MAIN_WEBSITE_URL;

  static readonly APP_VERSION = (() => {
    try {
      return readFileSync(path.resolve(dirname(fileURLToPath(import.meta.url)), "app_version.txt"), "utf8").trim();
    } catch (e) {
      if (AppSettings.IS_PRODUCTION) {
        // in dev mode this is expected, so log not needed
        console.debug("Could not read app version!");
      }
      return undefined;
    }
  })();

  static readonly DTO: AppSettingsDto = {
    appVersion: AppSettings.APP_VERSION,
    isProduction: AppSettings.IS_PRODUCTION,
    runMode: AppSettings.RUN_MODE,
    imprint: asHyperlinkDto(AppSettings.IMPRINT_LABEL, AppSettings.IMPRINT_URL),
    mainWebsite: asHyperlinkDto(AppSettings.MAIN_WEBSITE_LABEL, AppSettings.MAIN_WEBSITE_URL),
    githubRepositorySlug: AppSettings.GITHUB_REPOSITORY_SLUG,
  };
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

const securityTypes = ["STARTTLS", "TLS"] as const;
type SmtpSecurity = (typeof securityTypes)[number];

function isSmtpSecurity(s: string): s is SmtpSecurity {
  return securityTypes.includes(s as SmtpSecurity);
}

export class EmailSettings {
  static readonly SMTP_HOST: string | undefined = toNonBlankString(process.env.EMAIL_SMTP_HOST);
  static readonly SMTP_FROM: string | undefined = toNonBlankString(process.env.EMAIL_SMTP_FROM);
  static readonly SMTP_USER: string | undefined = toNonBlankString(process.env.EMAIL_SMTP_USER);
  static readonly SMTP_PASSWORD: string | undefined = toNonBlankString(process.env.EMAIL_SMTP_PASSWORD);
  static readonly SMTP_SECURITY: SmtpSecurity | undefined = toEnumValue(
    process.env.EMAIL_SMTP_SECURITY,
    (it) => (isSmtpSecurity(it) ? it : undefined),
    "TLS",
  );
  static readonly SMTP_PORT: number = toNumberOrDefault(
    process.env.EMAIL_SMTP_PORT,
    EmailSettings.SMTP_SECURITY === "STARTTLS" ? 587 : 465,
  );

  static readonly SMTP_OPTIONS: SMTPTransport.Options = {
    host: this.SMTP_HOST,
    port: this.SMTP_PORT,
    secure: this.SMTP_SECURITY !== "STARTTLS",
    requireTLS: AppSettings.IS_PRODUCTION,
    from: this.SMTP_FROM,
    auth:
      this.SMTP_USER && this.SMTP_PASSWORD
        ? {
            user: this.SMTP_USER,
            pass: this.SMTP_PASSWORD,
          }
        : undefined,
  } as const;

  static {
    if (!this.SMTP_HOST || !this.SMTP_FROM) {
      logger.warn(" 📭 ❓ No email server and/or email from address specified! The blog won't send any email notifications.");
    } else {
      if (AppSettings.IS_PRODUCTION && (!this.SMTP_USER || !this.SMTP_PASSWORD)) {
        logger.warn(
          " 📭 🗝 No username/password set for sending email! Are you sure, that your SMTP server does not need any authentication?",
        );
      }
      createTransport(this.SMTP_OPTIONS).verify(function (error, success) {
        const message = error
          ? " 📭 ❌ Failed to establish SMTP connection for sending e-mails!"
          : " 📬 ✅ Checked that SMTP connection for sending e-mails can be established";
        const log: LeveledLogMethod = error ? logger.error : logger.info;
        log(
          `${message}: ${EmailSettings.SMTP_HOST}:${EmailSettings.SMTP_PORT} (${EmailSettings.SMTP_SECURITY}) ${EmailSettings.SMTP_OPTIONS.auth ? "with username/password" : "with NO AUTHENTICATION!"}`,
        );
      });
    }
  }
}

export class ServerSettings {
  static readonly API_PATH: string = process.env.SERVER_API_PATH ?? "/api";
  static readonly PORT: number = toNumberOrDefault(process.env.SERVER_PORT, 5000);
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

export class OpenAISettings {
  static readonly API_KEY: string | undefined = process.env.OPENAI_API_KEY;
}

function toNonBlankString(value: string | undefined | null): string | undefined {
  const trimmed = value?.trim();
  if ((trimmed?.length ?? 0) > 0) {
    return trimmed;
  }
}

function toNumberOrDefault(value: string | undefined | null, defaultValue: number): number {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  return Number(value);
}

/**
 * Converts a string value to an "enum value" (string union type).
 *
 * @template T the string union type, can include undefined in case the cast function
 *   or the default value can yield `undefined`
 * @param {string | undefined | null} value - The value to be converted.
 * @param {(value: string) => T} cast - The function used to cast the value to the enum type.
 * @param {T} defaultValue - The default value to be returned if the input value is undefined or null.
 * @return {T} - The converted enum value.
 */
function toEnumValue<T extends string | undefined>(value: string | undefined | null, cast: (v: string) => T, defaultValue: T): T {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  return cast(value);
}
