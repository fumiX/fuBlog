import { OAUTH_TYPES, OAuthAccount, OAuthType } from "@fumix/fu-blog-common";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./User.entity.js";

@Entity("oauth_account")
export class OAuthAccountEntity implements OAuthAccount {
  @PrimaryGeneratedColumn()
  id?: number;
  @Column({ nullable: false, name: "oauth_id" })
  oauthId: string;

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.id)
  @JoinColumn({ name: "user_id" })
  user: UserEntity;
  @Column({ type: "enum", enum: OAUTH_TYPES, nullable: false })
  type: OAuthType;
  @Column({ nullable: false })
  domain: string;
}
