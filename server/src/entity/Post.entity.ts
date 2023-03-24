import { Post } from "@fumix/fu-blog-common";
import { AttachmentEntity } from "./Attachment.entity.js";
import { UserEntity } from "./User.entity.js";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

/**
 * Blog post
 */
@Entity("post")
export class PostEntity implements Post {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  markdown: string;

  @Column({ nullable: true })
  sanitizedHtml: string;

  @Column()
  createdAt: Date;

  @ManyToOne(() => UserEntity)
  createdBy?: UserEntity;

  @Column({ nullable: true })
  updatedAt?: Date;

  @ManyToOne(() => UserEntity, (user) => user.id, { nullable: true })
  updatedBy?: UserEntity;

  @OneToMany(() => AttachmentEntity, (attachment) => attachment.post, { nullable: true })
  attachments: AttachmentEntity[];

  @Column({ nullable: false })
  draft: boolean;
}
