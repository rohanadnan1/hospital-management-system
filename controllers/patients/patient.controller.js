import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import Patient from "../../models/patient.model.js";
import bcrypt from "bcrypt";
import { decodePassword } from "../../utils/passwords.js";

// --- LOGIN PATIENT ---
export const loginPatient = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Email aur password lazmi hain"));
  }

  // 1. Patient ko find karein
  const patient = await Patient.findOne({ email });
  if (!patient) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Patient nahi mila"));
  }

  // 2. Password match karein
  const isPasswordValid = decodePassword(password, patient.password);
  if (!isPasswordValid) {
    return res.status(401).json(new ApiResponse(401, null, "Ghalat password"));
  }

  // 3. Tokens Generate karein (Schema methods use karte hue)
  const accessToken = patient.generateAccessToken();
  const rawRefreshToken = patient.generateRefreshToken();

  // 4. SECURITY: Refresh Token ko Hash karke DB mein save karein
  const hashedRefreshToken = await bcrypt.hash(rawRefreshToken, 10);
  patient.refreshToken = hashedRefreshToken;

  // Validation bypass karein kyunke hum sirf token update kar rahe hain
  await patient.save({ validateBeforeSave: false });

  // 5. Response setup
  const options = {
    httpOnly: true, // Frontend JS isay access nahi kar sakegi
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  };

  const loggedInPatient = await Patient.findById(patient._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("refreshToken", rawRefreshToken, options) // Plain Refresh Token in Cookie
    .json(
      new ApiResponse(
        200,
        {
          patient: loggedInPatient,
          accessToken, // Access Token for Authorization Header
        },
        "Patient logged in successfully"
      )
    );
});
