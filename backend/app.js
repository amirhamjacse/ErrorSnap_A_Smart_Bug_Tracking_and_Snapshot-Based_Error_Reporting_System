import dotend from "dotenv";
dotend.config();

import cookieParser from "cookie-parser";
import express from "express";
import bodyParser from "body-parser";
import router from "./routes/index.js";
import authMiddleware from "./middleware/auth.js";
import { setCorsHeaders } from "./utils/cors.js";
import("./database/createTables.js");

const app = express();
app.use(express.json({ limit: "20mb" }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(setCorsHeaders);

app.use(authMiddleware);
app.use("/", router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.error("App initialized!");
  console.log(`Server is running port ${PORT}`);
});
