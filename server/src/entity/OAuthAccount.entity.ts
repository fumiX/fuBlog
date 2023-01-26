import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { UserEntity } from "./User.entity.js";
import type { SupportedOAuthProvider } from "@fumix/fu-blog-common";
import { OAuthAccount, SupportedOAuthProviders } from "@fumix/fu-blog-common";

@Entity("oauth_account")
@Unique(["oauthId", "provider"])
export class OAuthAccountEntity implements OAuthAccount {
  @PrimaryGeneratedColumn()
  id?: number;
  @Column({ nullable: false, name: "oauth_id" })
  oauthId: string;

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.id)
  @JoinColumn({ name: "user_id" })
  user: UserEntity;
  @Column({ type: "enum", enum: Object.keys(SupportedOAuthProviders), nullable: false })
  provider: SupportedOAuthProvider;
}
