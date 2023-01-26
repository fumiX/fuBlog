import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from "typeorm";
import { PostEntity } from "./Post.entity.js";
import { Attachment } from "@fumix/fu-blog-common";

@Entity("attachment")
export class AttachmentEntity implements Attachment {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ nullable: false })
  filename: string;

  @Column({ type: "bytea", nullable: false })
  binaryData: Buffer;

  @ManyToOne(() => PostEntity, { nullable: false })
  post: Relation<PostEntity>;

  @Column({ nullable: false })
  mimeType: string;
}
