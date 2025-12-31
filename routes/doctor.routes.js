import express from "express";
import {
  loginDoctorStep1,
  verifyOTPAndLogin,
} from "../controllers/doctors/doctors.controller.js";

const router = express.Router();

router.route("/login").post(loginDoctorStep1);
router.route("/verify-otp").post(verifyOTPAndLogin);

export default router;
