import type { UserRole } from "@fumix/fu-blog-common";
import { DataUrl, User, UserRoles } from "@fumix/fu-blog-common";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

/**
 * Blog post
 */
@Entity("user")
export class UserEntity implements User {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ nullable: false, type: "varchar" })
  username: string;

  @Column({ name: "is_active", nullable: false, type: "boolean" })
  isActive: boolean;

  @Column({ nullable: true, type: "text", name: "profile_picture_url" })
  profilePictureUrl?: DataUrl;

  @Column({ nullable: true, name: "full_name", type: "varchar" })
  fullName?: string;

  @Column({ unique: true, nullable: false, type: "varchar" })
  email: string;
  @Column({ type: "enum", enum: Object.keys(UserRoles), array: true, nullable: false })
  roles: UserRole[];
}
