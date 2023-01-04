import express, { Application } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { corsOptions } from "./config/cors-config.js";
import postRoutes from "./routes/posts.js";
import attRoutes from "./routes/attachments.js";
import authRoutes, { authenticate } from "./routes/auth.js";
import { generate } from "./service/testdata-generator.js";
import { AppDataSource } from "./data-source.js";
import { init as initAuth } from "./auth/middleware.js";

const app: Application = express();
const PORT = process.env.SERVER_PORT || 5000;

const BASE_API_PATH = process.env.SERVER_API_PATH || "/api";

AppDataSource.initialize()
  .then(async () => {
    generate();
    console.log("Database initialized")
  })
  .catch((err) => console.log("Error initializing database", err));

app.use(cors(corsOptions));

app.use(bodyParser.json());

// The OAuth2 middleware (used for authentication)
app.use(initAuth);

// Check the authentication status
app.all(`${BASE_API_PATH}/posts`, authenticate)

// The authentication controller routes
app.use("/auth", authRoutes);

app.use(`${BASE_API_PATH}/posts`, postRoutes);
app.use(`${BASE_API_PATH}/attachments`, attRoutes);

// in production serve the built vue-app from static public folder:
if (process.env.NODE_ENV === "production") {
  app.use(express.static("./public"));
}

app.listen(PORT, () => {
  console.log(`fuBlog server running on port: ${PORT}`);
});

export function getDomain(): string {
  return `http://${process.env.APP_HOST}:${process.env.APP_PORT}`;
}
