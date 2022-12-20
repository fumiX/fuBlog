import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { UserEntity } from "./User.entity";
import { Post } from "@fumix/fu-blog-common/dist/entity/Post";

/**
 * Blog post
 */
@Entity("post")
export class PostEntity implements Post {

    @PrimaryGeneratedColumn()
    id?: number

    @Column()
    title: string

    @Column({ nullable: true })
    description: string

    @Column({ nullable: true })
    markdown: string

    @Column({ nullable: true })
    sanitizedHtml: string

    @Column()
    createdAt: Date

    @ManyToOne(() => UserEntity)
    createdBy?: UserEntity

    @Column({ nullable: true })
    updatedAt?: Date

    @ManyToOne(() => UserEntity, (user) => user.id, { nullable: true })
    updatedBy?: UserEntity

}
