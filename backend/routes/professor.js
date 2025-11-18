// backend/routes/professor.js
// Integrated version with all existing functionality + recent professors
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Review from "../models/Review.js";
import Subject from "../models/Subject.js";

const router = express.Router();

// Middleware to verify professor token
const verifyProfessor = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "professor")
      return res.status(403).json({ message: "Access denied." });
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ message: "Invalid or expired token." });
  }
};

// Get Recent Professors (Last 5 added) - NEW - PUBLIC ROUTE
// This should be BEFORE protected routes to avoid middleware blocking
router.get("/recent", async (req, res) => {
  try {
    const recentProfessors = await User.find({ role: "professor" })
      .sort({ createdAt: -1 })
      .limit(5)
      .select(
        "name email university department country academicTitle averageRating"
      )
      .lean();

    res.json(recentProfessors);
  } catch (error) {
    console.error("❌ Error fetching recent professors:", error);
    res.status(500).json({ message: "Error fetching recent professors" });
  }
});

// Get logged-in professor profile
router.get("/me", verifyProfessor, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -__v");
    if (!user) return res.status(404).json({ message: "Professor not found." });
    res.json(user);
  } catch (err) {
    console.error("❌ Error fetching professor profile:", err.message);
    res.status(500).json({ message: "Failed to fetch profile." });
  }
});

// Update professor profile
router.put("/update", verifyProfessor, async (req, res) => {
  try {
    const updates = req.body;
    const updated = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select("-password");
    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating professor:", err.message);
    res.status(500).json({ message: "Profile update failed." });
  }
});

// Get all reviews for the logged-in professor
router.get("/my-reviews", verifyProfessor, async (req, res) => {
  try {
    const reviews = await Review.find({ professorId: req.user.id })
      .populate("studentId", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error("❌ Error loading professor reviews:", err.message);
    res.status(500).json({ message: "Failed to load reviews." });
  }
});

// Subjects management (your original functionality)
router.get("/subjects", verifyProfessor, async (req, res) => {
  try {
    const subjects = await Subject.find({ professorId: req.user.id });
    res.json(subjects);
  } catch {
    res.status(500).json({ message: "Failed to fetch subjects." });
  }
});

router.post("/subjects", verifyProfessor, async (req, res) => {
  try {
    const { subjectName, description } = req.body;
    if (!subjectName)
      return res.status(400).json({ message: "Subject name required." });

    const newSubject = new Subject({
      professorId: req.user.id,
      subjectName,
      description,
    });

    await newSubject.save();
    res.status(201).json(newSubject);
  } catch {
    res.status(500).json({ message: "Failed to add subject." });
  }
});

router.delete("/subjects/:id", verifyProfessor, async (req, res) => {
  try {
    await Subject.findOneAndDelete({
      _id: req.params.id,
      professorId: req.user.id,
    });
    res.json({ message: "Subject deleted successfully." });
  } catch {
    res.status(500).json({ message: "Failed to delete subject." });
  }
});

export default router;
