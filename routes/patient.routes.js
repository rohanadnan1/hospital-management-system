import express from "express";
import { loginPatient } from "../controllers/patients/patient.controller.js";

const router = express.Router();

router.route("/login").post(loginPatient);

export default router;
