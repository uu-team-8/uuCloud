import express from "express";
import dotenv from "dotenv";

dotenv.config();

console.log(process.env);
const app = express();
const port = process.env.PORT;

console.log(port);

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});