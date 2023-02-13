import { OAuthProvider } from "@/entity/OAuthProvider.js";
import type { User } from "./User.js";

export type OAuthAccount = {
  id?: number;
  oauthId: string;
  user: User;
  provider: OAuthProvider;
};
