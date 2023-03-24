import { OAuthProvider, OAuthType, UserRole, UserRolePermissions, UserRoles } from "@fumix/fu-blog-common";
import { EntityTarget, ObjectLiteral, Repository } from "typeorm";
import { AppDataSource } from "../data-source.js";
import { OAuthAccountEntity } from "../entity/OAuthAccount.entity.js";
import { UserEntity } from "../entity/User.entity.js";

/** A name for the tuples representing {@link UserRolePermissions} entries */
type PermissionKeyValue = [string, boolean];

/***
 * Retrieves the user account information supplied by the OAuth provider or null if no such record exits.
 *
 * @param id The id provided by the OAuth implementation
 * @param provider The name of the OAuth provider
 * @return The user account information or null if the user was not authenticated yet
 */
export async function findOAuthAccountBy(id: string, provider: OAuthProvider<OAuthType>): Promise<OAuthAccountEntity | null> {
  return await getRepositoryFor(OAuthAccountEntity).findOne({
    where: {
      oauthId: id,
      type: provider.type,
      domain: provider.domain,
    },
    relations: {
      user: true,
    },
  });
}

export async function createOAuthAccount(id: string, provider: OAuthProvider<OAuthType>, user: UserEntity) {
  const account: OAuthAccountEntity = {
    oauthId: id,
    type: provider.type,
    domain: provider.domain,
    user,
  };
  return getRepositoryFor(OAuthAccountEntity).save(account);
}

export function createUser(username: string, email: string, roles: UserRole[], fullName?: string) {
  const user: UserEntity = {
    username,
    fullName,
    email,
    roles,
    isActive: true,
  };
  return getRepositoryFor(UserEntity).save(user);
}

/**
 * Retrieves the user permissions associated with the user's roles.
 *
 * @param userId The id of the user
 * @return A collection of permissions associated with the user's roles or an empty
 * collection if no user could be found with the userId
 */
export async function getUserPermissions(userId: number): Promise<UserRolePermissions> {
  const user = await getRepositoryFor(UserEntity).findOne({
    where: {
      id: userId,
    },
  });
  let permissions = new UserRolePermissions("Blogger permissions", {});
  if (user) {
    const roles: UserRolePermissions[] = user.roles.map((role: UserRole) => UserRoles[role]);
    // Filter the collection of key-value pairs that are set to true
    const granted: Array<PermissionKeyValue> = roles.flatMap((role: UserRolePermissions) =>
      Object.entries(role).filter(([key, value]) => value !== false),
    );
    // These are the merged permissions
    permissions = { ...permissions, ...Object.fromEntries(granted) };
  }
  return permissions;
}

function getRepositoryFor<T extends ObjectLiteral>(entity: EntityTarget<T>): Repository<T> {
  return AppDataSource.manager.getRepository(entity);
}
