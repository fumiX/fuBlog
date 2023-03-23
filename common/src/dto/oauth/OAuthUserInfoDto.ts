import { UserInfoOAuthToken } from "@common/dto/oauth/SavedOAuthToken.js";
import { ExternalUserInfo } from "@common/entity/User.js";

export type OAuthUserInfoDto = {
  token: UserInfoOAuthToken;
  oauthId: string;
  user: ExternalUserInfo;
  isExisting: boolean;
};
