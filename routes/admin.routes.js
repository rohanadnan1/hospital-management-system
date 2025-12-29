import express from "express";
import {
  adminLogin,
  registerDoctor,
} from "../controllers/admin/admin.controller.js";
import { verifyAdmin } from "../middlewares/admin.middlewares.js";
import { registerPatient } from "../controllers/admin/admin.controller.js";

const router = express.Router();

router.route("/login").post(adminLogin);
router.route("/register-doctor").post(verifyAdmin, registerDoctor);
router.route("/register-patient").post(verifyAdmin, registerPatient);

export default router;
