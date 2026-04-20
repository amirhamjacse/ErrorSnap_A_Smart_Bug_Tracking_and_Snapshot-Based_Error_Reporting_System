import mysql from "mysql";
import dotend from "dotenv";

dotend.config({
  path: new URL("../.env", import.meta.url),
});

const requiredEnvNames = ["DB_HOST", "DB_USER", "DB_PASS", "DB_NAME"];
const missingEnvNames = requiredEnvNames.filter((name) => !process.env[name]);

if (missingEnvNames.length) {
  throw new Error(
    `Missing backend environment variables: ${missingEnvNames.join(", ")}. Create backend/.env from backend/env.example before starting the server.`
  );
}

export let con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});
