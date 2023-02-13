import { OAUTH_TYPES, OAuthAccount, OAuthProvider } from "@fumix/fu-blog-common";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { UserEntity } from "./User.entity.js";

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
  @Column({ type: "enum", enum: OAUTH_TYPES, nullable: false })
  provider: OAuthProvider;
}
