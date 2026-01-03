import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import Patient from "../../models/patient.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../utils/sendMail.js";
import { summarizePDF } from "../../utils/aiSummarizer.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";

// this controller is for the first login step where the user enters his/her email and pass and gets an otp on their email

export const loginPatientStep1 = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const patient = await Patient.findOne({ email });
  if (!patient) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Patient not found"));
  }

  const isPasswordValid = await bcrypt.compare(password, patient.password);
  if (!isPasswordValid) {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Invalid credentials"));
  }

  // creating a random otp on the server

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  patient.otp = otp;
  patient.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 mins valid
  await patient.save({ validateBeforeSave: false }); // validateBeforeSave: false means no validation needs to be checked just save this data in the db as it is

  // sending an email with the sendEmail utility function we have in the /middlewares folder
  await sendEmail(patient.email, otp);

  const sessionToken = jwt.sign(
    { _id: patient._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "10m" }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { sessionToken },
        "OTP sent to your email. Please verify."
      )
    );
});

// this controller is the 2nd login step where user confirms his/her otp and then the access is granted

export const verifyPatientOTP = asyncHandler(async (req, res) => {

  const { otp, sessionToken } = req.body;

  if (!otp || !sessionToken) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "OTP and Session Token are required"));
  }

  // verifying the session token created at the time of first login step

  const decodedToken = jwt.verify(
    sessionToken,
    process.env.ACCESS_TOKEN_SECRET
  );
  const patient = await Patient.findById(decodedToken._id);

  if (!patient || patient.otp !== otp || patient.otpExpiry < Date.now()) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Invalid or expired OTP"));
  }

  patient.otp = undefined;
  patient.otpExpiry = undefined;

  const accessToken = patient.generateAccessToken();
  const rawRefreshToken = patient.generateRefreshToken();

  patient.refreshToken = await bcrypt.hash(rawRefreshToken, 10);
  await patient.save({ validateBeforeSave: false });

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  };

  const loggedInPatient = await Patient.findById(patient._id).select(
    "-password -refreshToken -otp -otpExpiry" // these fields will not be send in the response
  );

  return res
    .status(200)
    .cookie("refreshToken", rawRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        { patient: loggedInPatient, accessToken },
        "Patient logged in successfully"
      )
    );
});

// this controller helps patients upload their pdf reports and then aiSummarizer will generate a summary for doctor's convinience 

export const uploadAndSummarizeReport = asyncHandler(async (req, res) => {
  const reportLocalPath = req.file?.path; // gets the local path of the pdf that we are uploading

  if (!reportLocalPath) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "PDF report is required"));
  }

  // this utilty function is for summarizing the pdf it returns a 3-4 liner summary for doctor's convinience

  const summary = await summarizePDF(reportLocalPath);

  // uploading the file on the cloudinary server

  const cloudinaryResponse = await uploadOnCloudinary(reportLocalPath);

  if (!cloudinaryResponse) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Failed to upload to Cloudinary"));
  }

  // updating the patient's medical history

  await Patient.findByIdAndUpdate(
    req.user._id,
    {
      $push: { // $push is an array operator in mongodb helps us to push new data into our medicalHistory list
        medicalHistory: {
          reportUrl: cloudinaryResponse.url,
          aiSummary: summary,
          uploadedAt: new Date(),
        },
      },
    },
    { new: true } // this gives us the updated data from the mongodb database
  ).select("-password");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        reportUrl: cloudinaryResponse.url,
        summary,
      },
      "Report uploaded and summarized by AI successfully"
    )
  );
});
