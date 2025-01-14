import mongoose from "mongoose";

const diseaseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  symptoms: {
    type: Array,
  },
  preventionSteps: {
    type: Array,
  },
  maxBeds: {
    type: Number,
    required: true,
  },
  availableBeds: {
    type: Number,
    default: 0,
  },
});

const Disease = mongoose.model("Disease", diseaseSchema);

export default Disease;
