import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm"
import {User} from "./User";

/**
 * Blog post
 */
@Entity()
export class Post {

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

    @ManyToOne(() => User)
    createdBy: User

    @Column({ nullable: true })
    updatedAt?: Date

    @ManyToOne(() => User, (user) => user.id, { nullable: true })
    updatedBy?: User

}
