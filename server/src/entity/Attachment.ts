import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";
import {Post} from "./Post";

@Entity()
export class Attachment {

    @PrimaryGeneratedColumn()
    id?: number

    @Column({nullable: false})
    filename: string

    @Column({type: "bytea", nullable: false})
    binaryData: Buffer

    @ManyToOne(() => User, {nullable: false})
    post: Post

    @Column({nullable: false})
    mimeType: string
}
