import { AppDataSource } from "../data-source.js";
import { OAuthAccountEntity } from "../entity/OAuthAccount.entity.js";
import { UserEntity } from "../entity/User.entity.js";
import { UserRole } from "@fumix/fu-blog-common";
import { EntityTarget, ObjectLiteral, Repository } from "typeorm";
import { SupportedOAuthProvider } from "@fumix/fu-blog-common";

/***
 * Retrieves the user account information supplied by the OAuth provider
 * @param id The id provided by the OAuth implementation
 * @param provider The name of the OAuth provider
 */
export async function findOAuthAccountBy(id: string, provider: SupportedOAuthProvider): Promise<OAuthAccountEntity | null> {
  return await getRepositoryFor(OAuthAccountEntity).findOne({
    where: {
      oauthId: id,
      provider
    }
  });
}

export function createUser(username: string, email: string, roles: UserRole[], firstName?: string, lastName?: string) {
  const user: UserEntity = {
    username,
    firstName,
    lastName,
    email,
    roles
  };

  // const account: OAuthAccountEntity = {
  //   id: 42,
  //   user: user,
  //   oauthId: "333",
  //   provider: SupportedOAuthProviders.GOOGLE
  // };
  // AppDataSource.manager.getRepository(OAuthAccountEntity).save(account);
}

function getRepositoryFor<T extends ObjectLiteral>(entity: EntityTarget<T>): Repository<T> {
  return AppDataSource.manager.getRepository(entity);
}
