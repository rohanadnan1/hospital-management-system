import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const response = await mongoose.connect(
      `${process.env.MONGODB_CONNECTION_STRING}/hospital-data`
    );
    console.log("MongoDB connection established");
    if (response) {
      console.log(`Connected to MongoDB: ${response?.connection?.host} `);
    }
  } catch (error) {
    console.log(error?.message || "Failed to connect to MongoDB");
  }
};

export default connectDB;
