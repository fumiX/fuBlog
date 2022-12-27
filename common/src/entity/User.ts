import type { UserRole } from "./UserRole.js";

export type User = {
  id?: number;
  firstName?: string;
  lastName?: string;
  username: string;
  email: string;
  roles: UserRole[];
};
