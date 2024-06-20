import { Tag } from "@fumix/fu-blog-common";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, Relation } from "typeorm";
import { PostEntity } from "./Post.entity.js";

/**
 * Blog post
 */
@Entity("tag")
export class TagEntity implements Tag {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ nullable: false, unique: true, type: "varchar" })
  name: string;

  @ManyToMany(() => PostEntity, (post) => post.tags)
  @JoinTable({ name: "post_tag", joinColumn: { name: "tag_id" }, inverseJoinColumn: { name: "post_id" } })
  posts?: Relation<PostEntity[]>;
}
