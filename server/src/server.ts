import express, {Application, Request, Response} from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { corsOptions } from "./config/cors-config";
import postRoutes from "./routes/posts";
import authRoutes from "./routes/auth";
import { AppDataSource } from "./data-source";
import { init as initAuth } from "./auth/middleware";

const app: Application = express();
const PORT = process.env.PORT || 5000;

const BASE_API_URL = "/api";

AppDataSource.initialize()
    .then(async () => console.log("Database initialized"))
    .catch((err) => console.log("Error initializing database", err));

app.use(cors(corsOptions));

app.use(bodyParser.json());

// The authorization (OAuth2) middleware
app.use(initAuth);
// The authorization controller routes
app.use("/auth", authRoutes);

app.use(`${BASE_API_URL}/posts`, postRoutes);

app.listen(PORT, () => {
    console.log(`fuBlog server running on port: ${PORT}`);
});
