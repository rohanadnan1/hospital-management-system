import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import Doctor from "../../models/doctor.model.js";
import bcrypt from "bcrypt";
import { sendEmail } from "../../utils/sendMail.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../../utils/apiError.js";

// this controller is for the first login step where the doctor enters his/her email and pass and gets an otp on their email

export const loginDoctorStep1 = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const doctor = await Doctor.findOne({ email });

  if (!doctor) {
    return res.status(404).json(new ApiResponse(404, null, "Doctor not found"));
  }

  const isPasswordValid = await bcrypt.compare(password, doctor.password);
  if (!isPasswordValid) {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Invalid credentials"));
  }

  // creating random otp
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  doctor.otp = otp;
  doctor.otpExpiry = Date.now() + 10 * 60 * 1000;
  await doctor.save({ validateBeforeSave: false });

  await sendEmail(doctor.email, otp);

  // generating a temporary token and will expire it in 10 mins to send user details further
  const sessionToken = jwt.sign(
    { _id: doctor._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "10m" }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { sessionToken },
        "OTP sent. Please verify using the session token."
      )
    );
});

// this controller is the 2nd login step where doctor confirms his/her otp and then the access is granted

export const verifyOTPAndLogin = asyncHandler(async (req, res) => {
  // session token which we have saved in the previous step to get the user

  const { otp, sessionToken } = req.body;

  if (!otp || !sessionToken) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "OTP and Session Token are required"));
  }

  const decodedToken = jwt.verify(
    sessionToken,
    process.env.ACCESS_TOKEN_SECRET
  );

  const doctor = await Doctor.findById(decodedToken._id);

  if (!doctor || doctor.otp !== otp || doctor.otpExpiry < Date.now()) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Invalid or expired OTP"));
  }

  doctor.otp = undefined;
  doctor.otpExpiry = undefined;

  const accessToken = doctor.generateAccessToken();
  const rawRefreshToken = doctor.generateRefreshToken();

  doctor.refreshToken = await bcrypt.hash(rawRefreshToken, 10);
  await doctor.save({ validateBeforeSave: false });

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("refreshToken", rawRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        { doctor, accessToken },
        "Doctor logged in successfully"
      )
    );
});

// this controller is for the doctor to see their assigned patients data

export const getAssignedPatients = asyncHandler(async (req, res) => {
  const doctorId = req.user?._id;

  if (!doctorId) {
    throw new ApiError(401, "Unauthorized request");
  }

  // for getting the data out of ids stored in the assignedPatients array

  const doctorWithPatients = await Doctor.findById(doctorId).populate({
    path: "assignedPatients",
    select: "name age gender email medicalHistory currentCondition bedAlloted",
    populate: {
      // for getting the nested properties like bed details
      path: "bedAlloted",
      select: "bedNumber bedType",
    },
  });

  if (!doctorWithPatients) {
    throw new ApiError(404, "Doctor record not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalPatients: doctorWithPatients.assignedPatients.length,
        patients: doctorWithPatients.assignedPatients,
      },
      "Allotted patients fetched successfully"
    )
  );
});

// when the access token is expired the user can generate a new access token with their refresh token

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "No refresh token provided");
  }

  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const doctor = await Doctor.findById(decodedToken?._id);

  if (!doctor) {
    throw new ApiError(401, "Doctor not found");
  }

  // this is the IMPORTANT part what happening here is if the refresh token send through cookies
  // or the body is not the same as in the database then it means the token is being compromised so we immediately
  // clear all the cookies and the user is being logged out and has to login again to generate new refresh and access token

  const isTokenValid = bcrypt.compare(
    incomingRefreshToken,
    doctor.refreshToken
  );

  if (!isTokenValid) {
    // (Server-side logout) by removing the refresh token from the database
    doctor.refreshToken = undefined;
    await doctor.save({ validateBeforeSave: false });

    // (Client-side logout) by clearning the cookies
    const options = { httpOnly: true, secure: true };

    return res
      .status(403)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(
        new ApiResponse(
          403,
          null,
          "Security Alert: Compromised token detected. All sessions cleared. Please login again."
        )
      );
  }

  const accessToken = doctor.generateAccessToken();
  const newRefreshToken = doctor.generateRefreshToken();

  // (REFRESH TOKEN ROTATION)
  doctor.refreshToken = newRefreshToken;
  await doctor.save({ validateBeforeSave: false });

  const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(new ApiResponse(200, { accessToken }, "Token rotated successfully"));
});
