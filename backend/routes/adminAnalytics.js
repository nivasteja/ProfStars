import express from "express";
import Professor from "../models/Professor.js";
import User from "../models/User.js";
import Review from "../models/Review.js";

const router = express.Router();

// ✅ Verify Admin Middleware
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

// ✅ Analytics Summary Route
router.get("/summary", verifyAdmin, async (req, res) => {
  try {
    // === Professor Counts ===
    const totalProfessors = await Professor.countDocuments();
    const approvedProfessors = await Professor.countDocuments({ isApproved: true });
    const pendingProfessors = await Professor.countDocuments({ isApproved: false });

    // === Student & Admin Counts ===
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalAdmins = await User.countDocuments({ role: "admin" });

    // === Average Rating ===
    const reviews = await Review.find();
    const avgRating =
      reviews.length > 0
        ? (
            reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
          ).toFixed(2)
        : 0;

    // === Top Universities by Approved Professors ===
    const topUniversities = await Professor.aggregate([
      { $match: { isApproved: true, university: { $ne: null } } },
      { $group: { _id: "$university", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // === Rating Trends (average per date) ===
    const ratingTrends = await Review.aggregate([
      {
        $group: {
          _id: { $substr: ["$createdAt", 0, 10] },
          avgRating: { $avg: "$rating" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      totalProfessors,
      approvedProfessors,
      pendingProfessors,
      totalStudents,
      totalAdmins,
      avgRating,
      topUniversities,
      ratingTrends,
    });
  } catch (err) {
    console.error("❌ Analytics fetch error:", err.message);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
});

export default router;
