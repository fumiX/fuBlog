import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { UserEntity } from "./User.entity";
import { OAuthAccount } from "@fumix/fu-blog-common/dist/entity/OAuthAccount"
import type { SupportedOAuthProvider } from "@fumix/fu-blog-common/dist/entity/SupportedOAuthProvider"
import { SupportedOAuthProviders } from "@fumix/fu-blog-common/dist/entity/SupportedOAuthProvider";

@Entity("oauth_account")
@Unique(["oauthId", "provider"])
export class OAuthAccountEntity implements OAuthAccount {
    @PrimaryGeneratedColumn()
    id: number
    @Column({ nullable: false })
    oauthId: string
    @ManyToOne(() => UserEntity)
    user: UserEntity
    @Column({ type: "enum", enum: Object.keys(SupportedOAuthProviders), nullable: false })
    provider: SupportedOAuthProvider
}
