// backend/routes/review.js
import express from "express";
import jwt from "jsonwebtoken";
import Review from "../models/Review.js";
import User from "../models/User.js";

const router = express.Router();

// Middleware to verify student
const verifyStudent = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "student")
      return res.status(403).json({ message: "Only students can submit reviews." });
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ message: "Invalid or expired token." });
  }
};

// 📋 Get all professors for search
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

    const professors = await User.find(filter).select("name university department country academicTitle");
    res.json(professors);
  } catch {
    res.status(500).json({ message: "Failed to load professors." });
  }
});

// 🧑‍🏫 Get single professor details with reviews
router.get("/professor/:id", async (req, res) => {
  try {
    const professor = await User.findById(req.params.id).select(
      "name email university department country academicTitle experienceYears"
    );
    if (!professor) return res.status(404).json({ message: "Professor not found." });

    const reviews = await Review.find({ professorId: professor._id })
      .populate("studentId", "name")
      .sort({ createdAt: -1 });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.json({ professor, reviews, avgRating });
  } catch {
    res.status(500).json({ message: "Failed to fetch professor details." });
  }
});

// ✍️ Add new review
router.post("/add", verifyStudent, async (req, res) => {
  try {
    const { professorId, rating, comment } = req.body;

    // Prevent duplicate review
    const existing = await Review.findOne({
      professorId,
      studentId: req.user.id,
    });
    if (existing)
      return res.status(400).json({ message: "You already reviewed this professor." });

    const review = new Review({
      professorId,
      studentId: req.user.id,
      rating,
      comment,
    });
    await review.save();

    res.status(201).json(review);
  } catch {
    res.status(500).json({ message: "Failed to submit review." });
  }
});

// ✳️ Student adds a new professor request
router.post("/add-professor", verifyStudent, async (req, res) => {
  try {
    const { name, university, department, country, academicTitle } = req.body;

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
      return res.status(400).json({ message: "Professor already exists in database." });

    // Create a new professor (pending approval)
    const newProfessor = new User({
      name,
      email: `${name.replace(/\s+/g, ".").toLowerCase()}@pending.profstars.com`,
      password: "temporary",
      role: "professor",
      university,
      department,
      country,
      academicTitle,
      isApproved: false, // must be approved by admin
    });

    await newProfessor.save();

    res.status(201).json({
      message: "Professor submitted successfully and is pending admin approval.",
    });
  } catch (error) {
    console.error("❌ Error in add-professor:", error.message);
    res.status(500).json({ message: "Failed to submit professor request." });
  }
});


export default router;
