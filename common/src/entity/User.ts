import { DataUrl } from "@common/util/base64.js";
import type { UserRole } from "./UserRole.js";

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

export type UserTheme = "lightTheme" | "darkTheme";
