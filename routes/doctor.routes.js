import express from "express";
import {
  getAssignedPatients,
  loginDoctorStep1,
  refreshAccessToken,
  verifyOTPAndLogin,
} from "../controllers/doctors/doctors.controller.js";
import { verifyDoctor } from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.route("/login").post(loginDoctorStep1);
router.route("/verify-otp").post(verifyOTPAndLogin);
router.route("/patients").get(verifyDoctor, getAssignedPatients);
router.route("/refresh-token").post(refreshAccessToken);

export default router;
