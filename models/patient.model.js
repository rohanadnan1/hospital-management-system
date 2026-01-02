import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
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
    medicalHistory: {
      type: Array,
    },
    currentCondition: {
      type: String,
      enum: ["emergency", "normal", "critical"],
    },
    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    dateOfBirth: {
      type: Date,
    },
    bedAlloted: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bed",
    },
    refreshToken: {
      type: String,
    },
    role: {
      type: String,
      default: "patient",
      immutable: true, // no one can change the role
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

patientSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
patientSchema.methods.generateRefreshToken = function () {
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

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;
