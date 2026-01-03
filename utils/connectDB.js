import mongoose from "mongoose";
import { initializeBeds } from "../controllers/beds/beds.controller.js";

const connectDB = async () => {
  try {
    const response = await mongoose.connect(
      `${process.env.MONGODB_CONNECTION_STRING}`
    );

    // this function is for initializing beds at the first time the db is connected we have 10 beds in total for the hospital at the moment
    
    await initializeBeds();
  } catch (error) {
    console.log(error?.message || "Failed to connect to MongoDB");
  }
};

export default connectDB;
