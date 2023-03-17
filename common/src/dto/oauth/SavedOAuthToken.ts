import { JsonWebToken } from "@/dto/oauth/JwtToken.js";
import { OAuthType } from "@/dto/oauth/OAuthType.js";

export type SavedOAuthToken = {
  id_token: JsonWebToken;
  type: OAuthType;
  issuer: string;
};

export type UserInfoOAuthToken = SavedOAuthToken & {
  access_token: string;
};
