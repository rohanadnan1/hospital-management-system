import express from "express";
import dotenv from "dotenv";

const app = express();

dotenv.config({
  path: ".env",
});

app.route("/").get(async (req, res) => {
  res.json({ message: "Hello, World!" });
});

export default app;
