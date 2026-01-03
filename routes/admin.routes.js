import express from "express";
import {
  adminLogin,
  allotResources,
  dischargePatient,
  getAvailableBeds,
  registerDoctor,
} from "../controllers/admin/admin.controller.js";
import { verifyAdmin } from "../middlewares/auth.middlewares.js";
import { registerPatient } from "../controllers/admin/admin.controller.js";

const router = express.Router();

router.route("/login").post(adminLogin);
router.route("/register-doctor").post(verifyAdmin, registerDoctor);
router.route("/register-patient").post(verifyAdmin, registerPatient);
router.route("/available-beds").get(verifyAdmin, getAvailableBeds);
router.route("/allot-resources").post(verifyAdmin, allotResources);
router.route("/discharge-patient").post(verifyAdmin, dischargePatient)
export default router;
