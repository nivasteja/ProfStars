// backend/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Basic information
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },

    // Role & approval
    role: {
      type: String,
      enum: ["student", "professor", "admin"],
      default: "student",
    },
    isApproved: {
      type: Boolean,
      default: function () {
        return this.role !== "professor"; // professors need admin approval
      },
    },
    // Add to userSchema
    bio: { type: String, trim: true, maxlength: 500 },
    profilePhoto: { type: String }, // URL to photo
    socialLinks: {
      linkedin: { type: String },
      researchGate: { type: String },
      googleScholar: { type: String },
    },
    profileViews: { type: Number, default: 0 },
    isProfilePublic: { type: Boolean, default: true },
    // Academic / global fields
    country: { type: String, trim: true },
    university: { type: String, trim: true },
    department: { type: String, trim: true },
    academicTitle: { type: String, trim: true },
    experienceYears: { type: Number, min: 0 },
    major: { type: String, trim: true },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
