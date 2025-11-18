import express from "express";
import Review from "../models/Review.js";
import User from "../models/User.js";
import mongoose from "mongoose";

const router = express.Router();

// Verify Professor
const verifyProfessor = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    if (decoded.role !== "professor")
      return res.status(403).json({ message: "Forbidden" });
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(403).json({ message: "Invalid token" });
  }
};
//  Professor Analytics Summary
router.get("/summary", verifyProfessor, async (req, res) => {
  try {
    const profId = new mongoose.Types.ObjectId(req.userId);

    const reviews = await Review.find({ professorId: profId }).sort({
      createdAt: 1,
    });
    const totalReviews = reviews.length;
    const avgRating =
      reviews.length > 0
        ? (
            reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length
          ).toFixed(2)
        : 0;

    // Monthly review trend
    const monthly = await Review.aggregate([
      { $match: { professorId: profId } },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json({ totalReviews, avgRating, monthly });
  } catch (err) {
    console.error("Professor analytics error:", err.message);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
});

export default router;
