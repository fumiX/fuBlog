import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Tag } from "@fumix/fu-blog-common";

/**
 * Blog post
 */
@Entity("tag")
export class TagEntity implements Tag {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ nullable: false, unique: true })
  name: string;
}
