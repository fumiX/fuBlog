import { UserRolePermissions } from "./permission/UserRolePermissions.js";

type UserRolesType = {
  ADMIN: UserRolePermissions;
  POST_CREATE: UserRolePermissions;
  POST_EDIT: UserRolePermissions;
  POST_DELETE: UserRolePermissions;
};

/**
 * Pseudo enum for the available user roles.
 * See https://youtu.be/jjMbPt_H3RQ for the reasoning behind doing it like this.
 */
export const UserRoles: UserRolesType = {
  ADMIN: new UserRolePermissions(
    "Can change roles of all users", //
    { canEditUserRoles: true },
  ),
  POST_CREATE: new UserRolePermissions(
    "Can create a new post and also edit their own posts", //
    { canCreatePost: true },
  ),
  POST_EDIT: new UserRolePermissions(
    "Can edit any existing post", //
    { canEditPost: true },
  ),
  POST_DELETE: new UserRolePermissions(
    "Can delete any existing post", //
    { canDeletePost: true },
  ),
} as const;

export type UserRole = keyof typeof UserRoles;
