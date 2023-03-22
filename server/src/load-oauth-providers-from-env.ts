import {
  assertUnreachable,
  FakeOAuthProvider,
  GitlabOAuthProvider,
  GoogleOAuthProvider,
  isNotNull,
  isOAuthType,
  OAUTH_TYPES,
  OAuthProvider,
  OAuthType,
} from "@fumix/fu-blog-common";
import { AppSettings } from "./settings.js";
import Dict = NodeJS.Dict;

const REGEX_OAUTH_ENV_VARS = /^OAUTH_([A-Z]+)(_([1-9]\d*))?_([A-Z_]+)$/g;
const OAUTH_ENV_VAR_KEYS = <const>["ISSUER", "CLIENT_ID", "CLIENT_SECRET"];
type OAuthEnvVarKey = (typeof OAUTH_ENV_VAR_KEYS)[number];

type OAuthEnvVar = {
  type: OAuthType; // type of OAuth provider (e.g. `google`, `gitlab`, `fake`)
  index: number; // index number to differentiate multiple providers of same type
  varKey: OAuthEnvVarKey; // name of the env var (e.g. `DOMAIN` or `CLIENT_ID` or `CLIENT_SECRET`)
  varValue: string; // value of the env var
};
type GroupedOAuthEnvVars = {
  // env vars grouped by type and index
  [type in OAuthType]?: {
    [index: number]: {
      [key in OAuthEnvVarKey]?: string;
    };
  };
};

function isEnvVarKey(key: string | undefined | null): key is OAuthEnvVarKey {
  return !!OAUTH_ENV_VAR_KEYS.find((it) => it === key);
}

function loadGroupedOAuthEnvVars(envDictionary: Dict<string>): GroupedOAuthEnvVars {
  return Object.keys(envDictionary)
    .map<OAuthEnvVar | null>((it) => {
      const [match] = it.matchAll(REGEX_OAUTH_ENV_VARS);
      if (match) {
        const [env, type, , i, varKey] = match;
        const varValue: string | undefined = envDictionary[env];
        const index = +(i ?? "0");
        if (isOAuthType(type) && isEnvVarKey(varKey) && varValue) {
          return { type, index, varKey, varValue };
        } else {
          console.log(`OAuth env var ${env}=${varValue} is ignored (does not match format)!`);
        }
      }
      return null;
    })
    .filter<OAuthEnvVar>(isNotNull)
    .reduce<GroupedOAuthEnvVars>((acc: GroupedOAuthEnvVars, v) => {
      // Get existing value in accumulator, or create empty one
      const type = acc[v.type] || [];
      const config = type[v.index] || {};
      // Add new value
      config[v.varKey] = v.varValue;
      // Insert back into accumulator
      type[v.index] = config;
      acc[v.type] = type;
      // Continue
      return acc;
    }, {});
}

export function loadOAuthProvidersFromEnv() {
  const loadedVars: GroupedOAuthEnvVars = loadGroupedOAuthEnvVars(process.env);
  const providers = OAUTH_TYPES.flatMap<OAuthProvider<OAuthType>>((type) => {
    const value = loadedVars[type] || {};
    return (Object.keys(value) as unknown as Array<number>)
      .map((i) => {
        console.log(`Index ${i}`);
        const clientId: string | undefined = value[i]["CLIENT_ID"];
        const clientSecret: string | undefined = value[i]["CLIENT_SECRET"];
        const issuer: string | undefined = value[i]["ISSUER"];

        if (issuer && issuer.includes("/")) {
          console.error(`OAuth issuer "${issuer}" must not contain a forward slash!`);
          return null;
        }

        if (type === "FAKE") {
          if (AppSettings.IS_PRODUCTION) {
            console.error("Fake OAuth is not allowed in production!");
            return null;
          }
          return new FakeOAuthProvider(i, clientId, clientSecret, issuer);
        } else if (!clientId || !clientSecret) {
          console.error(`Missing client ID and/or client secret for OAuth provider ${type} ${i} ${issuer}`);
          return null;
        }
        switch (type) {
          case "GITLAB":
            return new GitlabOAuthProvider(i, clientId, clientSecret, issuer);
          case "GOOGLE":
            return new GoogleOAuthProvider(i, clientId, clientSecret, issuer);
        }
        assertUnreachable(type);
      })
      .filter(isNotNull);
  });
  if (!AppSettings.IS_PRODUCTION && !providers.some((it) => it.type === "FAKE")) {
    providers.push(new FakeOAuthProvider());
  }
  return providers.filter((it, i, arr) => {
    if (arr.findIndex((a) => it.getIdentifier() === a.getIdentifier()) === i) {
      console.log(`Initialized OAuthProvider ${it.getIdentifier()}`);
    } else {
      console.error(`Duplicate OAuthProvider ${it.getIdentifier()}! This one is being ignored!`);
    }
  });
}
