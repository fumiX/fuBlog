import "reflect-metadata"
import { DataSource } from "typeorm"
import { Post } from "./entity/Post";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5020,
    username: "fublog",
    password: "8!06",
    database: "fublog",
    // TODO set this to false in the future
    synchronize: true,
    logging: false,
    entities: [ Post ],
    migrations: [],
    subscribers: [],
})
