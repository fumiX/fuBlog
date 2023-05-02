import { Post } from "@fumix/fu-blog-common";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AttachmentEntity } from "./Attachment.entity.js";
import { TagEntity } from "./Tag.entity.js";
import { UserEntity } from "./User.entity.js";

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

  @Column({ name: "sanitized_html", nullable: true })
  sanitizedHtml: string;

  @Column({ name: "created_at" })
  createdAt: Date;

  @JoinColumn({ name: "created_by_id", referencedColumnName: "id" })
  @ManyToOne(() => UserEntity)
  createdBy?: UserEntity;

  @Column({ name: "updated_at", nullable: true })
  updatedAt?: Date;

  @JoinColumn({ name: "updated_by_id", referencedColumnName: "id" })
  @ManyToOne(() => UserEntity, (user) => user.id, { nullable: true })
  updatedBy?: UserEntity;

  @OneToMany(() => AttachmentEntity, (attachment) => attachment.post, { nullable: true })
  attachments: AttachmentEntity[];

  @Column({ nullable: false })
  draft: boolean;

  @ManyToMany((type) => TagEntity, (tag) => tag.posts, {
    cascade: true,
    onUpdate: "NO ACTION",
    eager: true,
    orphanedRowAction: "delete",
  })
  @JoinTable({ name: "post_tag", joinColumn: { name: "post_id" }, inverseJoinColumn: { name: "tag_id" } })
  tags: TagEntity[];
}
