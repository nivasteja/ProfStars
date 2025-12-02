import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Review from "../models/Review.js";

const router = express.Router();

/* =======================================================
   ✅ Verify Admin Middleware
   ======================================================= */
const verifyAdmin = (req, res, next) => {
  console.log("\n=============================");
  console.log("🔍 Incoming Admin API Request");
  console.log("🔹 URL:", req.originalUrl);
  console.log("🔹 Method:", req.method);

  const authHeader = req.headers.authorization;
  console.log("🔹 Authorization Header:", authHeader || "NONE");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ No Bearer token found in Authorization header");
    console.log("=============================\n");
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  console.log("🔹 Extracted Token:", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token successfully verified!");
    console.log("Decoded Token:", decoded);

    if (decoded.role !== "admin") {
      console.log("⚠ Access denied - Role is not admin:", decoded.role);
      console.log("=============================\n");
      return res.status(403).json({ message: "Access denied: Not admin" });
    }

    req.user = decoded;
    console.log("✅ Admin access granted to:", decoded.email);
    console.log("=============================\n");
    next();
  } catch (err) {
    console.error("❌ JWT verification failed!");
    console.error("Error Message:", err.message);
    console.log("=============================\n");
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

/* =======================================================
   📊 Analytics Summary Route
   (used by /admin/analytics page)
   ======================================================= */
router.get("/summary", verifyAdmin, async (req, res) => {
  try {
    // ---- COUNTS ----
    const totalProfessors = await User.countDocuments({ role: "professor" });
    const approvedProfessors = await User.countDocuments({
      role: "professor",
      isApproved: true,
    });
    const pendingProfessors = await User.countDocuments({
      role: "professor",
      isApproved: false,
    });
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalAdmins = await User.countDocuments({ role: "admin" });

    // ---- AVERAGE RATING (OVERALL) ----
    const ratingAgg = await Review.aggregate([
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]);
    const avgRating =
      ratingAgg.length > 0 ? Number(ratingAgg[0].avg.toFixed(2)) : 0;

    // ---- TOP 5 UNIVERSITIES (by approved professors) ----
    // uses User collection so it matches your current data
    const topUniversities = await User.aggregate([
      {
        $match: {
          role: "professor",
          isApproved: true,
          university: { $ne: null, $ne: "" },
        },
      },
      {
        $group: {
          _id: "$university",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // ---- RATING TREND (average rating per day) ----
    const ratingTrends = await Review.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          avgRating: { $avg: "$rating" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // ---- RESPONSE (matches AdminAnalytics.jsx expectations) ----
    res.json({
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
    console.error("❌ Error fetching analytics:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
