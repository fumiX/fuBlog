import type { UserRole } from "./UserRole.js";

export type User = {
  id?: number;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  profilePicture?: Uint8Array;
  username: string;
  email: string;
  roles: UserRole[];
};
