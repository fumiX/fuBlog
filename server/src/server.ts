import express, { Application } from "express";
import bodyParser from "body-parser";

const app: Application = express();
const PORT = process.env.PORT || 5000;

const BASE_API_URL = "/api";

app.use(bodyParser.json());

app.use(`${BASE_API_URL}/posts`, require("./routes/posts"));


app.listen(PORT, () => {
    console.log(`fuBlog server running on port: ${PORT}`);
});