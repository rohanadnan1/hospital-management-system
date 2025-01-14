import mongoose from "mongoose";

const BedSchema = new mongoose.Schema({
  bedNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  diseaseCategory: {
    type: String,
    required: true,
  },
  isOccupied: {
    type: Boolean,
    default: false,
  },
  assignedPatient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    default: null,
  },
  bedType: {
    type: String,
    enum: ["emergency", "normal", "critical"],
    required: true,
  },
});

const Bed = mongoose.model("Bed", BedSchema);

export default Bed;
