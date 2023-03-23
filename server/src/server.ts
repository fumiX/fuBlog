import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import path from "path";
import { corsOptions } from "./config/cors-config.js";
import { AppDataSource } from "./data-source.js";
import adminRoutes from "./routes/admin.js";
import attRoutes from "./routes/attachments.js";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";
import { initDatabase } from "./service/testdata-generator.js";
import { AppSettings, ClientSettings, DatabaseSettings, ServerSettings } from "./settings.js";
import { logger } from "./logger.js";
import { errorHandler } from "./service/error-handler.js";
import { InternalServerError } from "./types/errors/InternalServerError.js";
import { BaseError } from "./types/errors/BaseError.js";

const app: Application = express();

await AppDataSource.initialize();
await initDatabase();

app.use(cors(corsOptions));

app.use(express.json());

// Check the authentication status
//app.all(`${ServerSettings.API_PATH}/posts/*`, authenticate);

// The authentication controller routes
app.use(`${ServerSettings.API_PATH}/auth`, authRoutes);

app.use(`${ServerSettings.API_PATH}/admin`, adminRoutes);

app.use(`${ServerSettings.API_PATH}/posts`, postRoutes);
app.use(`${ServerSettings.API_PATH}/attachments`, attRoutes);

// handle errors
app.use(async (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (!errorHandler.isOperationalError(err)) {
    next(err);
  } else {
    await errorHandler.handleError(err);
    if (err instanceof BaseError) {
      const baseError = err as BaseError;
      res.status(baseError.httpCode).send(baseError.message);
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
  logger.info("Shutting down fumix blog...", error.stack);
  process.exit(1);
}

// in production serve the built vue-app from static public folder:
if (AppSettings.IS_PRODUCTION) {
  app.use(express.static("./public"));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
  });
}

app.listen(ServerSettings.PORT, () => {
  logger.info(`fuBlog server running in ${AppSettings.RUN_MODE} mode on port: ${ServerSettings.PORT}`);
  if (!AppSettings.IS_PRODUCTION) {
    logger.info(`Connected to Postgres DB at ${DatabaseSettings.HOST}:${DatabaseSettings.PORT}`);
    logger.info(`Client: ${ClientSettings.BASE_URL}`);
  }
});
