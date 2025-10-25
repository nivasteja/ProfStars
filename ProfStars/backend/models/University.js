import mongoose from "mongoose";

const universitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    addedBy: {
      type: String,
      default: "user",
    },
  },
  { timestamps: true }
);

export default mongoose.model("University", universitySchema);
