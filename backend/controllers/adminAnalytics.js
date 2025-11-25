// backend/controllers/adminAnalytics.js
import Professor from "../models/Professor.js";
import User from "../models/User.js";
import Review from "../models/Review.js";

/* GET /api/admin/analytics/summary - Returns analytics data for dashboard + overview */
export const getAdminAnalytics = async (req, res) => {
  try {
    // Count totals
    const totalProfessors = await Professor.countDocuments();
    const approvedProfessors = await Professor.countDocuments({
      isApproved: true,
    });
    const pendingProfessors = await Professor.countDocuments({
      isApproved: false,
    });
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalAdmins = await User.countDocuments({ role: "admin" });

    // Average rating from Reviews
    const ratingAgg = await Review.aggregate([
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]);
    const avgRating = ratingAgg.length > 0 ? ratingAgg[0].avg.toFixed(2) : 0;

    // Top 5 universities by approved professors
    const topUniversities = await Professor.aggregate([
      { $match: { isApproved: true, university: { $ne: null } } },
      { $group: { _id: "$university", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Rating trend (average rating per day)
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
  } catch (error) {
    console.error("❌ Error fetching analytics:", error);
    res.status(500).json({ message: "Failed to load analytics data." });
  }
};
