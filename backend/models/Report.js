// backend/models/Report.js
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    targetType: { type: String, enum: ["professor", "university"], required: true },
    targetName: { type: String, required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: false },
    reason: { type: String, required: true },
    details: { type: String },
    email: { type: String },
    handled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
