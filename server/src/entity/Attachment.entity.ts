import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from "typeorm";
import { PostEntity } from "./Post.entity.js";

@Entity()
export class AttachmentEntity {
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
