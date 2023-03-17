import { SavedOAuthToken } from "@/dto/oauth/SavedOAuthToken.js";

export type OAuthUserInfoDto = {
  token: SavedOAuthToken;
  oauthId: string;
  user: {
    email?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    profilePicture?: Uint8Array;
  };
  isExisting: boolean;
};
