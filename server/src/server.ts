import bodyParser from "body-parser";
import cors from "cors";
import express, { Application } from "express";
import path from "path";
import { init as initAuth } from "./auth/middleware.js";
import { corsOptions } from "./config/cors-config.js";
import { AppDataSource } from "./data-source.js";
import attRoutes from "./routes/attachments.js";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";
import { generate } from "./service/testdata-generator.js";
import { AppSettings, ServerSettings } from "./settings.js";

const app: Application = express();

await AppDataSource.initialize();
await generate();
console.log("Database initialized");

app.use(cors(corsOptions));

app.use(bodyParser.json());

// The authorization (OAuth2) middleware
app.use(initAuth);
// The authorization controller routes
app.use("/auth", authRoutes);

app.use(`${ServerSettings.API_PATH}/posts`, postRoutes);
app.use(`${ServerSettings.API_PATH}/attachments`, attRoutes);

// in production serve the built vue-app from static public folder:
if (AppSettings.IS_PRODUCTION) {
  app.use(express.static("./public"));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
  });
}

app.listen(ServerSettings.PORT, () => {
  console.log(`fuBlog server running on port: ${ServerSettings.PORT}`);
});
