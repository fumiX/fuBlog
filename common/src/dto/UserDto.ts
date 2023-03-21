import { UserRolePermissionsType } from "@common/entity/permission/UserRolePermissions.js";
import { UserRole } from "@common/entity/UserRole.js";

export type UserDto = {
  id?: number;
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  permissions?: UserRolePermissionsType;
  roles: UserRole[];
  profilePictureUrl?: string;
};
