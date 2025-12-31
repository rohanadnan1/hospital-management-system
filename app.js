import express from "express";
import dotenv from "dotenv";
import pateintRouter from "./routes/patient.routes.js";
import adminRouter from "./routes/admin.routes.js";
import doctorRouter from "./routes/doctor.routes.js";

const app = express();

dotenv.config({
  path: ".env",
});

app.use(express.json());

app.use("/patient", pateintRouter);
app.use("/admin", adminRouter);
app.use("/doctor", doctorRouter);

export default app;
