import express, {Application} from "express";
import bodyParser from "body-parser";
import cors from "cors";
import {corsOptions} from "./config/cors-config.js";
import postRoutes from "./routes/posts.js";
import {generate} from "./service/testdata-generator.js";
import {AppDataSource} from "./data-source.js";


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

// in production serve the built vue-app from static public folder:
if (process.env.NODE_ENV === "production") {
    app.use(express.static(`${__dirname}/public`));
}

app.listen(PORT, () => {
    console.log(`fuBlog server running on port: ${PORT}`);
});
