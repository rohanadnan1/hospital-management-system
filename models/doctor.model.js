import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  specialization: {
    type: Array,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  assignedPatients: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Patient",
  },
  isAvailable: {
    type: Boolean,
    default: true,
    required: true,
  },
  otp: {
    type: String,
  },
  otpExpiry: {
    type: Date,
  },
  refreshToken: {
    type: String,
  }
});

doctorSchema.virtual("assignedPatientsCount").get(function () {
  return this.assignedPatients.length;
});

doctorSchema.pre("save", async function (next) {
  this.isAvailable = this.assignedPatientsCount < 3;
  next();
});

doctorSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      role: "doctor",
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
doctorSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
