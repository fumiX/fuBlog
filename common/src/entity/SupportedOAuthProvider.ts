type OAuthProvider = {
  id: string;
  name: string;
  availableInProduction: boolean;
};

type SupportedOAuthProvidersType = {
  GOOGLE: OAuthProvider;
  FAKE: OAuthProvider;
};

export const SupportedOAuthProviders: SupportedOAuthProvidersType = {
  FAKE: {
    id: "fake_oauth",
    name: "Fake OAuth",
    availableInProduction: false
  } as OAuthProvider,
  GOOGLE: {
    id: "https://accounts.google.com",
    name: "Google",
    availableInProduction: true
  } as OAuthProvider
};

export function findOAuthProviderById(id: string): SupportedOAuthProvider | null {
  let providerKey = null;
  Object.entries(SupportedOAuthProviders).forEach(([key, value]: [string, OAuthProvider]) => {
    if (value.id === id) {
      providerKey = key;
    }
  });
  return providerKey ? (providerKey as SupportedOAuthProvider) : null;
}

export type SupportedOAuthProvider = keyof typeof SupportedOAuthProviders;
