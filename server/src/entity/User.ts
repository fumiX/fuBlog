import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

/**
 * Blog post
 */
@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id?: number

    @Column({ nullable: true })
    firstName: string

    @Column({ nullable: true })
    lastName: string

    @Column({ nullable: true })
    birthdate: Date

    @Column({ unique: true, nullable: false })
    email: string

}
