import { OAuthProviderId } from "@common/dto/oauth/OAuthType.js";
import { DataUrl } from "@common/util/base64.js";
import type { UserRole } from "./UserRole.js";

/**
 * The user info, which we get from the OAuth provider.
 */
export type ExternalUserInfo = {
  email: string;
  username?: string;
  fullName?: string;
  profilePictureUrl?: DataUrl;
};

export type User = {
  id?: number;
  fullName?: string;
  isActive: boolean;
  profilePictureUrl?: DataUrl;
  username: string;
  email: string;
  roles: UserRole[];
};

export type PublicUserInfo = Pick<User, "id" | "fullName" | "isActive" | "profilePictureUrl" | "username">;

export type UserWithOAuthProviders = User & {
  oauthProviders: OAuthProviderId[];
};

export type UserTheme = "lightTheme" | "darkTheme";
