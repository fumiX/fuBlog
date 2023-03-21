import { User } from "@common/entity/User.js";
import { UserRoles } from "@common/entity/UserRole.js";

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
  public readonly description: string;
  public readonly canEditUserRoles = false;
  public readonly canCreatePost = false;
  public readonly canEditPost = false;
  public readonly canDeletePost = false;

  /**
   * Constructor for easier instance creation.
   * @param description
   * @param partial
   */
  public constructor(description: string, partial: Partial<UserRolePermissionsType>) {
    this.description = description;
    Object.assign(this, partial);
  }
}
