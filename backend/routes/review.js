// backend/routes/review.js
import express from "express";
import jwt from "jsonwebtoken";
import Review from "../models/Review.js";
import User from "../models/User.js";
import Subject from "../models/Subject.js";
import { verifyToken } from "../middleware/auth.js";


const router = express.Router();

// Middleware to verify student
const verifyStudent = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "student")
      return res
        .status(403)
        .json({ message: "Only students can perform this action." });
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ message: "Invalid or expired token." });
  }
};

// Get all professors for search with average ratings
router.get("/professors", async (req, res) => {
  try {
    const { q } = req.query;

    const filter = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { university: { $regex: q, $options: "i" } },
            { department: { $regex: q, $options: "i" } },
          ],
          role: "professor",
          isApproved: true,
        }
      : { role: "professor", isApproved: true };

    const professors = await User.find(filter).select(
      "name university department country academicTitle"
    );

    const professorsWithRatings = await Promise.all(
      professors.map(async (prof) => {
        const reviews = await Review.find({ professorId: prof._id });
        const avgRating =
          reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;
        return { ...prof.toObject(), averageRating: avgRating };
      })
    );

    res.json(professorsWithRatings);
  } catch (err) {
    console.error("Error fetching professors:", err);
    res.status(500).json({ message: "Failed to load professors." });
  }
});

// Get single professor details with all fields + reviews + subjects
router.get("/professor/:id", async (req, res) => {
  try {
    const professor = await User.findById(req.params.id).select(
      "name email university department country academicTitle experienceYears major bio isProfilePublic profileViews socialLinks"
    );
    if (!professor)
      return res.status(404).json({ message: "Professor not found." });

    const reviews = await Review.find({ professorId: professor._id })
      .populate("studentId", "name")
      .sort({ createdAt: -1 });

    const subjects = await Subject.find({ professorId: professor._id }).select(
      "subjectName description"
    );

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.json({ professor, reviews, subjects, avgRating });
  } catch (err) {
    console.error("❌ Error fetching professor details:", err);
    res.status(500).json({ message: "Failed to fetch professor details." });
  }
});

// Add new review
router.post("/add", verifyToken, async (req, res) => {

  try {
    const studentId = req.user.id;  // 👈 Take from token, not body
    const { professorId, rating, comment, semester, subject } = req.body;

    const review = new Review({
      studentId,
      professorId,
      rating,
      comment,
      semester,
      subject
    });

    await review.save();
    res.status(201).json({ message: "Review added", review });
  } catch (err) {
    console.error("Review creation error:", err);
    res.status(500).json({ message: "Failed to add review" });
  }
});

// Student submits a new professor for admin approval
router.post("/add-professor", verifyStudent, async (req, res) => {
  try {
    const { name, university, department, country, academicTitle, bio } = req.body;

    if (!name || !university || !department || !country) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if professor already exists
    const existing = await User.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
      university: { $regex: `^${university}$`, $options: "i" },
      role: "professor",
    });

    if (existing)
      return res
        .status(400)
        .json({ message: "Professor already exists in database." });

    const newProfessor = new User({
      name,
      email: `${name.replace(/\s+/g, ".").toLowerCase()}@pending.profstars.com`,
      password: "temporary",
      role: "professor",
      university,
      department,
      country,
      academicTitle,
      bio: bio || "",
      isApproved: false,
      isProfilePublic: true,
      profileViews: 0,
      socialLinks: { linkedin: "", researchGate: "", googleScholar: "" },
    });

    await newProfessor.save();

    res.status(201).json({
      message: "Professor submitted successfully and is pending admin approval.",
      professor: newProfessor,
    });
  } catch (error) {
    console.error("❌ Error in add-professor:", error.message);
    res.status(500).json({ message: "Failed to submit professor request." });
  }
});

// Redirect for my-reviews
router.get("/my-reviews", (req, res) => {
  res.redirect("/api/professor/my-reviews");
});

export default router;
