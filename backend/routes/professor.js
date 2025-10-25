// backend/routes/professor.js
import express from "express";
import User from "../models/User.js";
import Subject from "../models/Subject.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// 🔐 Middleware to verify professor token
const verifyProfessor = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ message: "Invalid or expired token." });
  }
};

// 🧑‍🏫 Get professor profile
router.get("/profile", verifyProfessor, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user || user.role !== "professor") {
      return res.status(403).json({ message: "Access denied." });
    }
    res.json(user);
  } catch {
    res.status(500).json({ message: "Failed to fetch profile." });
  }
});

// ✏️ Update professor profile
router.put("/profile", verifyProfessor, async (req, res) => {
  try {
    const updates = req.body;
    const updated = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select("-password");
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Profile update failed." });
  }
});

// 📚 Get subjects
router.get("/subjects", verifyProfessor, async (req, res) => {
  try {
    const subjects = await Subject.find({ professorId: req.user.id });
    res.json(subjects);
  } catch {
    res.status(500).json({ message: "Failed to fetch subjects." });
  }
});

// ➕ Add subject
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

// ❌ Delete subject
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
