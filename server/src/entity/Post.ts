import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany} from "typeorm"
import {User} from "./User";
import {Attachment} from "./Attachment";

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

    @OneToMany(() => Attachment, (attachment) => attachment.post, { nullable: true })
    attachments: Attachment[]

    @Column({ nullable: false })
    draft: boolean

}
