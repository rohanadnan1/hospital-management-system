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

  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

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

  // here we are setting the req.user to the token it because we are not saving the admin data in the db it's just on the server 
  req.user = decodedToken;

  next();
});

export const verifyPatient = asyncHandler(async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request: No token provided");
  }

  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  const patient = await Patient.findById(decodedToken?._id).select(
    "-password -refreshToken"
  );

  if (!patient) {
    throw new ApiError(401, "Invalid Access Token: Patient not found");
  }

  if (decodedToken?.role !== "patient") {
    throw new ApiError(
      403,
      "Access Denied: You are not authorized as a patient"
    );
  }

  req.user = patient;
  next();
});

export const verifyDoctor = asyncHandler(async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "No token provided");
  }

  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  // decodedToken.role is set to "doctor" when we were signing the jwt so we can decode the token and get the role
  // out of it

  if (decodedToken?.role !== "doctor") {
    throw new ApiError(403, "Access Denied: Role is not Doctor");
  }

  // finding doctor in the db if not found jusst return not found

  const doctor = await Doctor.findById(decodedToken?._id).select(
    "-password -refreshToken"
  );

  if (!doctor) {
    throw new ApiError(404, "Doctor record no longer exists");
  }

  req.user = doctor;
  next();
});
