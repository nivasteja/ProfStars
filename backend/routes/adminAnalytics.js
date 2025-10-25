import express from "express";
import User from "../models/User.js";
import Review from "../models/Review.js";

const router = express.Router();

// 🔒 Verify Admin Middleware
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    if (decoded.role !== "admin")
      return res.status(403).json({ message: "Access denied" });
    next();
  } catch {
    res.status(403).json({ message: "Invalid token" });
  }
};

// 📊 Admin Analytics Summary
router.get("/summary", verifyAdmin, async (req, res) => {
  try {
    // User stats
    const totalProfessors = await User.countDocuments({ role: "professor" });
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalAdmins = await User.countDocuments({ role: "admin" });

    const approvedProfessors = await User.countDocuments({
      role: "professor",
      isApproved: true,
    });
    const pendingProfessors = await User.countDocuments({
      role: "professor",
      isApproved: false,
    });
    const studentAdded = await User.countDocuments({
      email: /@pending\.profstars\.com$/,
    });

    // Reviews
    const reviews = await Review.find();
    const avgRating =
      reviews.length > 0
        ? (
            reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
            reviews.length
          ).toFixed(2)
        : 0;

    // Top universities
    const topUniversities = await User.aggregate([
      { $match: { role: "professor", isApproved: true } },
      { $group: { _id: "$university", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      totalProfessors,
      totalStudents,
      totalAdmins,
      approvedProfessors,
      pendingProfessors,
      studentAdded,
      avgRating,
      topUniversities,
    });
  } catch (err) {
    console.error("❌ Analytics error:", err.message);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
});

export default router;
