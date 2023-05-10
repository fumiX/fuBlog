import { Tag } from "@fumix/fu-blog-common";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, Relation } from "typeorm";
import { PostEntity } from "./Post.entity.js";
import { AutoMap } from "@automapper/classes";

/**
 * Blog post
 */
@Entity("tag")
export class TagEntity implements Tag {
  @AutoMap()
  @PrimaryGeneratedColumn()
  id?: number;

  @AutoMap()
  @Column({ nullable: false, unique: true })
  name: string;

  @AutoMap()
  @ManyToMany(() => PostEntity, (post) => post.tags)
  @JoinTable({ name: "post_tag", joinColumn: { name: "tag_id" }, inverseJoinColumn: { name: "post_id" } })
  posts?: Relation<PostEntity[]>;
}
