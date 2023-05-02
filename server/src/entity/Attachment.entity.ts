import { Attachment } from "@fumix/fu-blog-common";
import { FileEntity } from "./File.entity.js";
import type { Relation } from "typeorm";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PostEntity } from "./Post.entity.js";

@Entity("attachment")
export class AttachmentEntity implements Attachment {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ nullable: false })
  filename: string;

  @JoinColumn({ name: "post_id", referencedColumnName: "id" })
  @ManyToOne(() => PostEntity, (post) => post.attachments, { nullable: false })
  post: Relation<PostEntity>;

  @JoinColumn({ name: "file_sha256", referencedColumnName: "sha256" })
  @ManyToOne(() => FileEntity, { nullable: false, eager: true })
  file: FileEntity;
}
