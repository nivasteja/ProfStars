// backend/models/Subject.js
import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    professorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subjectName: {
      type: String,
      required: true,
      trim: true,
    }, // Add to subjectSchema
    courseCode: { type: String, trim: true }, // e.g., CS101
    semester: { type: String }, // e.g., Fall 2024
    category: {
      type: String,
      enum: ["Core", "Elective", "Graduate", "Undergraduate", "Other"],
      default: "Other",
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Subject", subjectSchema);
