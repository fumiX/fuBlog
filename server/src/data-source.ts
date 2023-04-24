import path from "path";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { DatabaseSettings } from "./settings.js";

// This is the full URL to the current module which in Node.js is the file path
// (including the "file://" scheme) - thus in order to obtain an absolute path
// we have to strip the URL-Scheme.
const baseDir = path.dirname(import.meta.url).slice("file://".length);

export const AppDataSource = new DataSource({
  type: "postgres",
  host: DatabaseSettings.HOST,
  port: DatabaseSettings.PORT,
  username: DatabaseSettings.USER,
  password: DatabaseSettings.PASSWORD,
  database: DatabaseSettings.NAME,
  synchronize: false,
  logging: true,
  entities: [path.join(baseDir, "entity/*.{js,ts}")],
  migrations: ["./src/migration/*.ts", "./migration/*.js"],
  migrationsRun: true,
  subscribers: [],
});
