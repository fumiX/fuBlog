import { OAuthType } from "@common/dto/oauth/OAuthType.js";
import type { User } from "@common/entity/User.js";

export type OAuthAccount = {
  id?: number;
  oauthId: string;
  user: User;
  type: OAuthType;
  domain: string;
};
