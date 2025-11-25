// backend/routes/professor.js
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Review from "../models/Review.js";
import Subject from "../models/Subject.js";
import { verifyStudent } from "../middleware/verifystudent.js";

const router = express.Router();

/**
 * Middleware: Verify Professor JWT
 */
const verifyProfessor = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "professor")
      return res.status(403).json({ message: "Access denied." });
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ JWT verify error:", err.message);
    res.status(403).json({ message: "Invalid or expired token." });
  }
};

/**
 * GET /professors/recent
 * Public route: Last 5 professors added
 */
router.get("/recent", async (req, res) => {
  try {
    const recentProfessors = await User.find({
      role: "professor",
      isApproved: true,
    })
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

/**
 * GET /professors/me
 * Get profile of logged-in professor
 */
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

/**
 * PUT /professors/update
 * Update logged-in professor profile
 */
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

/**
 * GET /professors/my-reviews
 * Get all reviews for logged-in professor
 */
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

/**
 * Subjects CRUD for professors
 */

// GET all subjects for professor
router.get("/subjects", verifyProfessor, async (req, res) => {
  try {
    const subjects = await Subject.find({ professorId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(subjects);
  } catch (err) {
    console.error("❌ Error fetching subjects:", err.message);
    res.status(500).json({ message: "Failed to fetch subjects." });
  }
});

// POST new subject
router.post("/subjects", verifyProfessor, async (req, res) => {
  try {
    const { subjectName, description, courseCode, semester, category } =
      req.body;
    if (!subjectName)
      return res.status(400).json({ message: "Subject name required." });

    const newSubject = new Subject({
      professorId: req.user.id,
      subjectName,
      description: description || "",
      courseCode: courseCode || "",
      semester: semester || "",
      category: category || "Other",
    });

    await newSubject.save();
    res.status(201).json(newSubject);
  } catch (err) {
    console.error("❌ Failed to add subject:", err.message);
    res.status(500).json({ message: "Failed to add subject." });
  }
});

// PUT update subject (THIS WAS MISSING!)
router.put("/subjects/:id", verifyProfessor, async (req, res) => {
  try {
    const { subjectName, description, courseCode, semester, category } =
      req.body;

    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, professorId: req.user.id },
      { subjectName, description, courseCode, semester, category },
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.json(subject);
  } catch (err) {
    console.error("❌ Failed to update subject:", err.message);
    res.status(500).json({ message: "Failed to update subject." });
  }
});

// DELETE subject
router.delete("/subjects/:id", verifyProfessor, async (req, res) => {
  try {
    const deleted = await Subject.findOneAndDelete({
      _id: req.params.id,
      professorId: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.json({ message: "Subject deleted successfully." });
  } catch (err) {
    console.error("❌ Failed to delete subject:", err.message);
    res.status(500).json({ message: "Failed to delete subject." });
  }
});

/**
 * POST /professors/add
 * Student submits a professor for admin approval
 */
router.post("/add", verifyStudent, async (req, res) => {
  try {
    const { name, department, university } = req.body;

    if (!name || !department || !university) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
      university: { $regex: `^${university}$`, $options: "i" },
      role: "professor",
    });

    if (existing) {
      return res.status(400).json({ message: "Professor already exists." });
    }

    const newProfessor = new User({
      name,
      email: `${name.replace(/\s+/g, ".").toLowerCase()}@pending.profstars.com`,
      password: "temporary",
      role: "professor",
      department,
      university,
      isApproved: false,
      addedBy: req.user._id,
    });

    await newProfessor.save();

    res.status(201).json({
      message: "Professor submitted for admin approval",
      professor: newProfessor,
    });
  } catch (err) {
    console.error("❌ Failed to add professor:", err.message);
    res.status(500).json({ message: "Failed to submit professor." });
  }
});

/**
 * GET /professors/:id
 * Get professor by ID (public)
 */
router.get("/:id", async (req, res) => {
  try {
    const professor = await User.findOne({
      _id: req.params.id,
      role: "professor",
    }).select("-password -__v");

    if (!professor) {
      return res.status(404).json({ message: "Professor not found" });
    }

    res.json(professor);
  } catch (err) {
    console.error("❌ Error fetching professor:", err.message);
    res.status(500).json({ message: "Failed to fetch professor." });
  }
});

export default router;
