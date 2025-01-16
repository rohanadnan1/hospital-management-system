import express from "express";
import { registerPatient } from "../controllers/patient.controller.js";

const router = express.Router();

router.route('/register').post(registerPatient);

export default router;

