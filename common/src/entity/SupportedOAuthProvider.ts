type OAuthProvider = {
  name: string;
  availableInProduction: boolean;
};

type SupportedOAuthProvidersType = {
  GOOGLE: OAuthProvider;
  FAKE: OAuthProvider;
};

export const SupportedOAuthProviders: SupportedOAuthProvidersType = {
  FAKE: {
    name: "Fake OAuth",
    availableInProduction: false,
  },
  GOOGLE: {
    name: "Google",
    availableInProduction: true,
  },
} as const;

export type SupportedOAuthProvider = keyof typeof SupportedOAuthProviders;
