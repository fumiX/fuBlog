import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import { readFile, writeFileSync } from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { corsOptions } from "./config/cors-config.js";
import { AppDataSource } from "./data-source.js";
import { BaseError } from "./errors/BaseError.js";
import { InternalServerError } from "./errors/InternalServerError.js";
import { logger } from "./logger.js";
import adminRoutes from "./routes/admin.js";
import attRoutes from "./routes/attachments.js";
import authRoutes from "./routes/auth.js";
import fileRoutes from "./routes/file.js";
import postRoutes from "./routes/posts.js";
import utilityRoutes from "./routes/utility.js";
import { errorHandler } from "./service/error-handler.js";
import { initDatabase } from "./service/testdata-generator.js";
import { AppSettings, ClientSettings, DatabaseSettings, ServerSettings } from "./settings.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app: Application = express();

await AppDataSource.initialize();
await initDatabase();

app.use(express.json());
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cors(corsOptions));

// Check the authentication status
//app.all(`${ServerSettings.API_PATH}/posts/*`, authenticate);

// The authentication controller routes
app.use(`${ServerSettings.API_PATH}/auth`, authRoutes);

app.use(`${ServerSettings.API_PATH}/admin`, adminRoutes);

app.use(`${ServerSettings.API_PATH}/file`, fileRoutes);

app.use(`${ServerSettings.API_PATH}/posts`, postRoutes);

app.use(`${ServerSettings.API_PATH}/attachments`, attRoutes);

app.use(`${ServerSettings.API_PATH}/utility`, utilityRoutes);
// handle errors
app.use(async (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (!errorHandler.isOperationalError(err)) {
    next(err);
  } else {
    await errorHandler.handleError(err);
    if (err instanceof BaseError) {
      res.status(err.httpCode).send(err.message);
    }
  }
});

process.on("unhandledRejection", (error) => {
  throw new InternalServerError(true, "Unhandled rejection " + error);
});

process.on("uncaughtException", async (error) => {
  await handleUncaught(error);
});

async function handleUncaught(error: Error) {
  await errorHandler.handleError(error);
  logger.info(`Shutting down fumix blog...\n${error.stack}`);
  process.exit(1);
}

// in production serve the built vue-app from static public folder:
if (AppSettings.IS_PRODUCTION) {
  const indexResponse = (req: Request, res: Response) => {
    readFile(
      path.join(__dirname, "public/index.html"), //
      { encoding: "utf-8" },
      (err, data) => {
        if (err) {
          res.status(404).send(null);
        } else {
          res.status(200).send(data.replace("%VITE_APP_DATA%", JSON.stringify(AppSettings.DTO)));
        }
      },
    );
  };
  app.get("/index.html", indexResponse);
  app.use(express.static("./public", { redirect: false, index: false }));
  app.get("*", indexResponse);
} else {
  writeFileSync("../client/.env.development", "VITE_APP_DATA=" + JSON.stringify(AppSettings.DTO), { encoding: "utf-8" });
}

app.listen(ServerSettings.PORT, () => {
  logger.info(
    `▶️ fuBlog server${AppSettings.IS_PRODUCTION ? ` version ${AppSettings.APP_VERSION ?? "‹unknown›"}` : ""} running in ${
      AppSettings.RUN_MODE
    } mode on port: ${ServerSettings.PORT}`,
  );
  logger.info(`🗄️ Expecting Postgres DB at ${DatabaseSettings.HOST}:${DatabaseSettings.PORT}`);
  logger.info(`🖥️ Expecting to be published at ${ClientSettings.BASE_URL}`);
});
