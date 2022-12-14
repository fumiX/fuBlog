import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import type { UserRole } from "@fumix/fu-blog-common";
import { User, UserRoles } from "@fumix/fu-blog-common";

/**
 * Blog post
 */
@Entity("user")
export class UserEntity implements User {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ nullable: false })
  username: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ unique: true, nullable: false })
  email: string;
  @Column({ type: "enum", enum: Object.keys(UserRoles), array: true, nullable: false })
  roles: UserRole[];
}
