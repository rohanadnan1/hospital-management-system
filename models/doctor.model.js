import mongoose from "mongoose";

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
});

doctorSchema.virtual("assignedPatientsCount").get(function () {
  return this.assignedPatients.length;
});

doctorSchema.pre("save", async function (next) {
  this.isAvailable = this.assignedPatientsCount < 3;
  next();
});

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
