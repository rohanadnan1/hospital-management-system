import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import Doctor from "../../models/doctor.model.js";
import bcrypt from "bcrypt";
import { sendEmail } from "../../utils/sendMail.js";
import jwt from "jsonwebtoken"

export const loginDoctorStep1 = asyncHandler(async (req, res) => {
    
    const { email, password } = req.body;

    const doctor = await Doctor.findOne({ email });

    if (!doctor) {
        return res.status(404).json(new ApiResponse(404, null, "Doctor not found"));
    }

    const isPasswordValid = await bcrypt.compare(password, doctor.password);
    if (!isPasswordValid) {
        return res.status(401).json(new ApiResponse(401, null, "Invalid credentials"));
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
        { expiresIn: '10m' }
    );

    return res.status(200).json(
        new ApiResponse(200, { sessionToken }, "OTP sent. Please verify using the session token.")
    );
});


export const verifyOTPAndLogin = asyncHandler(async (req, res) => {

    // session token which we have saved in the previous step to get the user

    const { otp, sessionToken } = req.body; 

    if (!otp || !sessionToken) {
        return res.status(400).json(new ApiResponse(400, null, "OTP and Session Token are required"));
    }

    const decodedToken = jwt.verify(sessionToken, process.env.ACCESS_TOKEN_SECRET);
    
    const doctor = await Doctor.findById(decodedToken._id);

    if (!doctor || doctor.otp !== otp || doctor.otpExpiry < Date.now()) {
        return res.status(400).json(new ApiResponse(400, null, "Invalid or expired OTP"));
    }

    doctor.otp = undefined;
    doctor.otpExpiry = undefined;

    const accessToken = doctor.generateAccessToken();
    const rawRefreshToken = doctor.generateRefreshToken();

    doctor.refreshToken = await bcrypt.hash(rawRefreshToken, 10);
    await doctor.save({ validateBeforeSave: false });

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    };

    return res
        .status(200)
        .cookie("refreshToken", rawRefreshToken, options)
        .json(
            new ApiResponse(200, { doctor, accessToken }, "Doctor logged in successfully")
        );
});