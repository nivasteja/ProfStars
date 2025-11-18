import express from "express";
import Subject from "../models/Subject.js";

const router = express.Router();

// ✅ Get all subjects with professor info
router.get("/", async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate("professorId", "name university department country averageRating") // link to professor
      .lean();

    res.json(subjects);
  } catch (err) {
    console.error("Error fetching subjects:", err);
    res.status(500).json({ message: "Failed to fetch subjects" });
  }
});

export default router;
