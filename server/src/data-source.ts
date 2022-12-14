import dotenv from "dotenv";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { AttachmentEntity } from "./entity/Attachment.entity.js";
import { PostEntity } from "./entity/Post.entity.js";
import { UserEntity } from "./entity/User.entity.js";
import { DatabaseSettings } from "./settings.js";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: DatabaseSettings.HOST,
  port: DatabaseSettings.PORT,
  username: DatabaseSettings.USER,
  password: DatabaseSettings.PASSWORD,
  database: DatabaseSettings.NAME,
  synchronize: false,
  logging: false,
  entities: [AttachmentEntity, PostEntity, UserEntity],
  migrations: ["./src/migration/*.ts"],
  migrationsRun: true,
  subscribers: [],
});
