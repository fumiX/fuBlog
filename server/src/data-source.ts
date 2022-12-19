import "reflect-metadata"
import { DataSource } from "typeorm"
import { UserEntity } from "./entity/User.entity";
import { PostEntity } from "./entity/Post.entity";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5020,
    username: "fublog",
    password: "8!06",
    database: "fublog",
    synchronize: false,
    logging: false,
    entities: [ UserEntity, PostEntity ],
    migrations: ["./src/migration/*.ts"],
    migrationsRun: true,
    subscribers: [],
})
