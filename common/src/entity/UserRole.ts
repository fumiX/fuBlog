import { User } from "@common/entity/User.js";
import { UserRolePermissions, UserRolePermissionsType } from "./permission/UserRolePermissions.js";

/**
 * Pseudo enum for the available user roles.
 * See https://youtu.be/jjMbPt_H3RQ for the reasoning behind doing it like this.
 */
export const UserRoles = {
  ADMIN: new UserRolePermissions(
    "Can change roles of all users, has all permissions.", //
    { canEditUserRoles: true, canCreatePost: true, canEditPost: true, canDeletePost: true },
  ),
  WRITER: new UserRolePermissions(
    "Can create a new post and also edit their own posts", //
    { canCreatePost: true },
  ),
  EDITOR: new UserRolePermissions(
    "Can edit and delete any existing post", //
    { canEditPost: true, canDeletePost: true },
  ),
} as const;

export function permissionsForUser(user: User): UserRolePermissionsType {
  return mergePermissions(user.roles.map((it) => UserRoles[it]));
}
function mergePermissions(permissions: UserRolePermissionsType[]): UserRolePermissionsType {
  return {
    canCreatePost: permissions.some((it) => it.canCreatePost),
    canDeletePost: permissions.some((it) => it.canDeletePost),
    canEditPost: permissions.some((it) => it.canEditPost),
    canEditUserRoles: permissions.some((it) => it.canEditUserRoles),
  };
}

// The union of N property names comprising the UserRoles - "prop!" | "prop2" ... | "propN"
export type UserRole = keyof typeof UserRoles;
