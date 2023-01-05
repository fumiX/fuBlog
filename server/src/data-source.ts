import "reflect-metadata";
import { DataSource } from "typeorm";
import path from "path";

// This is the full URL to the current module which in Node.js is the file path
// (including the "file://" scheme) - thus in order to obtain an absolute path
// we have to strip the URL-Scheme.
const baseDir = path.dirname(import.meta.url).slice("file://".length);

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST,
  port: (process.env.DATABASE_PORT as unknown as number) || 5020,
  username: process.env.DATABASE_USER || "fublog",
  password: process.env.DATABASE_PW || "8!06",
  database: process.env.DATABASE_NAME || "fublog",
  synchronize: false,
  logging: false,
  entities: [path.join(baseDir, "entity/*.ts")],
  migrations: ["./src/migration/*.ts"],
  migrationsRun: true,
  subscribers: []
});
