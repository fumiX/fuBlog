import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

/**
 * Blog post
 */
@Entity()
export class Post {

    @PrimaryGeneratedColumn()
    id: number

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

    @Column()
    createdBy: string

    @Column({ nullable: true })
    updatedAt: Date

    @Column({ nullable: true })
    updatedBy: string

}
