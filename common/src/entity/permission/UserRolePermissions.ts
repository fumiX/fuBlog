export type UserRolePermissionsType = {
  /**
   * This is `true` when the user is allowed to give any user additional permissions,
   * and also remove their current permissions. Otherwise: `false`.
   */
  canEditUserRoles: boolean;
  /**
   * This is `true` when the user is allowed to create a new blogpost.
   * They are additionally allowed to edit those posts, which they created themselves.
   * Otherwise: `false`.
   */
  canCreatePost: boolean;
  /**
   * This is `true` when the user is allowed to edit any blogpost. Otherwise: `false`.
   */
  canEditPost: boolean;
  /**
   * This is `true` when the user is allowed to delete any blogpost. Otherwise: `false`.
   */
  canDeletePost: boolean;
};

/**
 * Defines a set of rights/permissions that can be given to a user.
 * This type is best instantiated like this:
 */
export class UserRolePermissions implements UserRolePermissionsType {
  /** A user readable description of the permissions (in English) */
  description: string;
  canEditUserRoles = false;
  canCreatePost = false;
  canEditPost = false;
  canDeletePost = false;

  /**
   * Constructor for easier instance creation.
   * @param description
   * @param partial
   */
  public constructor(description: string, partial: Partial<UserRolePermissionsType>) {
    Object.assign(this, partial);
  }
}
