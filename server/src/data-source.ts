import "reflect-metadata"
import { DataSource } from "typeorm"
import { Post } from "./entity/Post";
import { User } from "./entity/User";
import {Attachment} from "./entity/Attachment";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5020,
    username: "fublog",
    password: "8!06",
    database: "fublog",
    synchronize: false,
    logging: false,
    entities: [ Post, User, Attachment ],
    migrations: ["./src/migration/*.ts"],
    migrationsRun: true,
    subscribers: [],
})
