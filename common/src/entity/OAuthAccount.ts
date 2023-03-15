import { OAuthType } from "@/dto/oauth/OAuthType.js";
import type { User } from "@/entity/User.js";

export type OAuthAccount = {
  id?: number;
  oauthId: string;
  user: User;
  type: OAuthType;
  domain: string;
};
