import Patient from "../models/patient.model.js";
import { asyncHandler, ApiError, hashPassword, ApiResponse } from "../utils/index.js";

const registerPatient = asyncHandler(async (req, res) => {
  const { name, email, password, age, gender, condition } = req.body;

  const existingPatient = await Patient.findOne({ email });

  if (!email || !password || !age || !gender || !condition) {
    throw new ApiError(400, "All fields are required");
  }

  if (existingPatient) {
    throw new ApiError(400, "Email already registered");
  }

  const hashedPassword = await hashPassword(password);

  const newPatient = await Patient.create({
    name,
    email,
    password: hashedPassword,
    age,
    gender,
    condition,
  });

  await newPatient.save();

  res
    .status(201)
    .json(new ApiResponse(201, newPatient, "Patient registered successfully"));
});

export { registerPatient };
