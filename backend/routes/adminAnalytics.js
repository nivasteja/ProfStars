// // backend/routes/adminAnalytics.js
// import express from "express";
// import jwt from "jsonwebtoken";
// import User from "../models/User.js";
// import Review from "../models/Review.js";

// const router = express.Router();

// // ✅ Verify Admin Middleware
// const verifyAdmin = (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1];
//   if (!token) return res.status(401).json({ message: "No token provided" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     if (decoded.role !== "admin") {
//       return res.status(403).json({ message: "Access denied: Not admin" });
//     }
//     req.user = decoded;
//     next();
//   } catch (err) {
//     console.error("JWT verification failed:", err.message);
//     return res.status(403).json({ message: "Invalid or expired token" });
//   }
// };

// // ✅ Analytics route
// router.get("/summary", verifyAdmin, async (req, res) => {
//   try {
//     const totalProfessors = await User.countDocuments({ role: "professor" });
//     const approvedProfessors = await User.countDocuments({
//       role: "professor",
//       isApproved: true,
//     });
//     const pendingProfessors = await User.countDocuments({
//       role: "professor",
//       isApproved: false,
//     });
//     const totalStudents = await User.countDocuments({ role: "student" });
//     const totalAdmins = await User.countDocuments({ role: "admin" });
//     const reviews = await Review.find();
//     const avgRating =
//       reviews.length > 0
//         ? (
//             reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
//             reviews.length
//           ).toFixed(2)
//         : 0;

//     res.json({
//       totalProfessors,
//       approvedProfessors,
//       pendingProfessors,
//       totalStudents,
//       totalAdmins,
//       avgRating,
//     });
//   } catch (err) {
//     console.error("Error fetching analytics:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// export default router;

import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Review from "../models/Review.js";

const router = express.Router();

/* =======================================================
   ✅ Verify Admin Middleware (Debug Version)
   ======================================================= */
const verifyAdmin = (req, res, next) => {
  // Log the raw Authorization header
  console.log("\n=============================");
  console.log("🔍 Incoming Admin API Request");
  console.log("🔹 URL:", req.originalUrl);
  console.log("🔹 Method:", req.method);
  console.log("🔹 Authorization Header:", req.headers.authorization);
  console.log("=============================\n");

  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.log("❌ No token provided by frontend!");
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Verify token using your secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token successfully verified!");
    console.log("Decoded Token:", decoded);

    if (decoded.role !== "admin") {
      console.log("⚠️ Access denied - Role is not admin:", decoded.role);
      return res.status(403).json({ message: "Access denied: Not admin" });
    }

    // Save user info in request
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
   📊 Analytics Summary Route (Uses verifyAdmin)
   ======================================================= */
router.get("/summary", verifyAdmin, async (req, res) => {
  try {
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
    const reviews = await Review.find();
    const avgRating =
      reviews.length > 0
        ? (
            reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
            reviews.length
          ).toFixed(2)
        : 0;

    res.json({
      totalProfessors,
      approvedProfessors,
      pendingProfessors,
      totalStudents,
      totalAdmins,
      avgRating,
    });
  } catch (err) {
    console.error("❌ Error fetching analytics:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
