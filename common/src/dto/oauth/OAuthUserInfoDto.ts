import { UserInfoOAuthToken } from "@common/dto/oauth/SavedOAuthToken.js";

export type OAuthUserInfoDto = {
  token: UserInfoOAuthToken;
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
