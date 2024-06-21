import type { UserRolePermissionsType } from "@common/entity/permission/UserRolePermissions.js";
import type { User } from "@common/entity/User.js";

export type LoggedInUserInfo = {
  user: User;
  permissions: UserRolePermissionsType;
};
