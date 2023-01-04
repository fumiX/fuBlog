import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { PostEntity } from "./entity/Post.entity.js";
import { UserEntity } from "./entity/User.entity.js";
import { AttachmentEntity } from "./entity/Attachment.entity.js";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST,
  port: (process.env.DATABASE_PORT as unknown as number) || 5020,
  username: process.env.DATABASE_USER || "fublog",
  password: process.env.DATABASE_PW || "8!06",
  database: process.env.DATABASE_NAME || "fublog",
  synchronize: false,
  logging: false,
  entities: [AttachmentEntity, PostEntity, UserEntity],
  migrations: ["./src/migration/*.ts"],
  migrationsRun: true,
  subscribers: [],
});
