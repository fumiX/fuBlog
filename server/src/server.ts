import express, {Application} from "express";
import bodyParser from "body-parser";
import cors from "cors";
import {corsOptions} from "./config/cors-config";
import postRoutes from "./routes/posts";
import {generate} from "./service/testdata-generator";
import {AppDataSource} from "./data-source";

const app: Application = express();
const PORT = process.env.SERVER_PORT || 3000;

const BASE_API_PATH = process.env.SERVER_API_PATH || "/api";

AppDataSource.initialize()
    .then(async () => {
        generate();
        console.log("Database initialized")
    })
    .catch((err) => console.log("Error initializing database", err));



app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use(`${BASE_API_PATH}/posts`, postRoutes);

app.listen(PORT, () => {
    console.log(`fuBlog server running on port: ${PORT}`);
});