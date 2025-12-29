import jwt from "jsonwebtoken";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import Doctor from "../../models/doctor.model.js";
import Patient from "../../models/patient.model.js";
import { hashPassword } from "../../utils/passwords.js";

export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@hospital.com";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Invalid Admin Credentials!"));
  }

  const adminToken = jwt.sign(
    { role: "admin", email: ADMIN_EMAIL },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", adminToken, options)
    .json(
      new ApiResponse(
        200,
        { token: adminToken, role: "admin" },
        "Admin logged in successfully"
      )
    );
});

export const registerDoctor = asyncHandler(async (req, res) => {
  const { name, email, password, specialization } = req.body;

  // all the fields are requeired no field can be empty

  if ([name, email, password].some((field) => !field || field?.trim() === "")) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          null,
          "All fields (name, email, password) are required"
        )
      );
  }

  // 2. Check agar doctor pehle se exist karta hai
  const existedDoctor = await Doctor.findOne({ email });
  if (existedDoctor) {
    return res.status(409).json(
      // Conflict if doctor already exists
      new ApiResponse(409, null, "Doctor with this email already exists")
    );
  }

  // 3. Password hashing
  hashPassword(password);

  // 4. Doctor creation
  const doctor = await Doctor.create({
    name,
    email,
    password: hashedPassword,
    specialization,
  });

  // 5. Response se password hatana (Security)
  const createdDoctor = await Doctor.findById(doctor._id).select("-password");

  if (!createdDoctor) {
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          null,
          "Something went wrong while registering the doctor"
        )
      );
  }

  // 6. Professional Response using ApiResponse
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdDoctor,
        "Doctor registered successfully by Admin"
      )
    );
});

export const registerPatient = asyncHandler(async (req, res) => {
  const { name, email, password, age, gender, currentCondition } = req.body;

  // 1. Validation check
  if ([name, email, password, gender].some((field) => field?.trim() === "")) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          null,
          "Zaroori fields (name, email, password, gender) missing hain"
        )
      );
  }

  // 2. Check if patient already exists
  const existedPatient = await Patient.findOne({ email });
  if (existedPatient) {
    return res
      .status(409)
      .json(
        new ApiResponse(
          409,
          null,
          "Is email se patient pehle hi registered hai"
        )
      );
  }

  // 3. Password Hashing
  const hashedPassword = await hashPassword(password);

  // 4. Create Patient in DB
  const patient = await Patient.create({
    name,
    email,
    password: hashedPassword,
    age,
    gender,
    currentCondition: currentCondition || "normal",
  });

  // 5. Password hata kar data bhejien
  const createdPatient = await Patient.findById(patient._id).select(
    "-password"
  );

  return res
    .status(201)
    .json(
      new ApiResponse(201, createdPatient, "Patient registration kamyab rahi")
    );
});
