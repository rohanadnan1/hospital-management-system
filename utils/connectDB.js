import mongoose from "mongoose";
import { initializeBeds } from "../controllers/beds/beds.controller.js";

const connectDB = async () => {
  try {
    const response = await mongoose.connect(
      `${process.env.MONGODB_CONNECTION_STRING}`
    );
    await initializeBeds();
  } catch (error) {
    console.log(error?.message || "Failed to connect to MongoDB");
  }
};

export default connectDB;
