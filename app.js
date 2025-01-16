import express from "express";
import dotenv from "dotenv";
import pateintRouter from "./routes/patient.routes.js";

const app = express();

dotenv.config({
  path: ".env",
});

app.use(express.json());

app.use("/patient", pateintRouter);

export default app;
