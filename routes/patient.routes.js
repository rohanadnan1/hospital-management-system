import express from "express";
import {
  loginPatientStep1,
  verifyPatientOTP,
} from "../controllers/patients/patient.controller.js";

const router = express.Router();

router.route("/login").post(loginPatientStep1);
router.route("/verify-otp").post(verifyPatientOTP)

export default router;
