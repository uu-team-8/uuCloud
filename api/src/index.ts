import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import routes from "./routes";
import initDatabases from "./databases";

dotenv.config();

const app = express();
const port = process.env.PORT;

initDatabases();

app.use(cors());
app.use(express.json());
app.use(routes);

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
