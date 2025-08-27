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

  @Column("varchar")
  title: string;

  @Column({ nullable: true, type: "varchar" })
  description: string;

  @Column({ nullable: true, type: "varchar" })
  markdown: string;

  @Column({ name: "sanitized_html", nullable: true, type: "varchar" })
  sanitizedHtml: string;

  @Column({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @JoinColumn({ name: "created_by_id", referencedColumnName: "id" })
  @ManyToOne(() => UserEntity)
  createdBy?: UserEntity;

  @Column({ name: "updated_at", nullable: true, type: "timestamp" })
  updatedAt?: Date;

  @JoinColumn({ name: "updated_by_id", referencedColumnName: "id" })
  @ManyToOne(() => UserEntity, (user) => user.id, { nullable: true })
  updatedBy?: UserEntity;

  @OneToMany(() => AttachmentEntity, (attachment) => attachment.post, { nullable: true })
  attachments: AttachmentEntity[];

  @Column({ nullable: false, type: "boolean" })
  draft: boolean;

  @ManyToMany((type) => TagEntity, (tag) => tag.posts, {
    cascade: true,
    onUpdate: "NO ACTION",
    eager: true,
    orphanedRowAction: "delete",
    onDelete: "CASCADE",
  })
  @JoinTable({ name: "post_tag", joinColumn: { name: "post_id" }, inverseJoinColumn: { name: "tag_id" } })
  tags: TagEntity[];
}
