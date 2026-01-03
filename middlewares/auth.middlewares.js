import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import Patient from "../models/patient.model.js";
import Doctor from "../models/doctor.model.js";

export const verifyAdmin = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Unauthorized: No token provided"));
  }

  // 2. Token decode aur verify karna
  // Note: Agar token invalid hoga toh jwt.verify error throw karega jo asyncHandler handle kar lega
  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  // 3. Role check karna
  if (decodedToken?.role !== "admin") {
    return res
      .status(403)
      .json(
        new ApiResponse(
          403,
          null,
          "Forbidden: Only Admin can access this route"
        )
      );
  }

  req.user = decodedToken;

  next();
});

export const verifyPatient = asyncHandler(async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json(
          new ApiResponse(401, null, "Unauthorized request: No token provided")
        );
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const patient = await Patient.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!patient) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "Invalid Access Token"));
    }

    req.patient = patient;
    next();
  } catch (error) {
    return res
      .status(401)
      .json(
        new ApiResponse(401, null, error?.message || "Invalid Access Token")
      );
  }
});

export const verifyDoctor = asyncHandler(async (req, res, next) => {
  try {
    // 1. Header se token nikalna
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "No token provided"));
    }

    // 2. Token ko verify aur decode karna
    // decodedToken mein wo sab hoga jo aapne login ke waqt payload mein dala tha
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // 3. Token se role nikal kar check karein
    if (decodedToken?.role !== "doctor") {
      return res
        .status(403)
        .json(new ApiResponse(403, null, "Access Denied: Role is not Doctor"));
    }

    // 4. (Optional but Recommended) Database se doctor ki details lein
    // kyunki aapko controller mein doctor ka data (jaise assignedPatients) chahiye hoga
    const doctor = await Doctor.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!doctor) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "Doctor record no longer exists"));
    }

    // 5. Request object mein doctor save kardein
    req.user = doctor;
    next();
  } catch (error) {
    return res
      .status(401)
      .json(
        new ApiResponse(401, null, error?.message || "Invalid Access Token")
      );
  }
});
