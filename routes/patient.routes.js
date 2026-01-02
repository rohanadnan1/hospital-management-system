import express from "express";
import {
  loginPatientStep1,
  uploadAndSummarizeReport,
  verifyPatientOTP,
} from "../controllers/patients/patient.controller.js";
import { verifyPatient } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = express.Router();

router.route("/login").post(loginPatientStep1);
router.route("/verify-otp").post(verifyPatientOTP);
router
  .route("/upload-report")
  .post(upload.single("file"), verifyPatient, uploadAndSummarizeReport);


export default router;
