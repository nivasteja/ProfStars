// backend/routes/admin.js
import express from "express";
import User from "../models/User.js";

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
  } catch (err) {
    console.error("❌ Invalid token:", err.message);
    res.status(403).json({ message: "Invalid token" });
  }
};

// ✅ GET: Pending Professors (for admin dashboard)
router.get("/pending-professors", verifyAdmin, async (req, res) => {
  try {
    const professors = await User.find({ role: "professor", isApproved: false })
      .sort({ createdAt: -1 })
      .select("-password"); // exclude password
    res.status(200).json(professors);
  } catch (err) {
    console.error("❌ Error fetching pending professors:", err.message);
    res.status(500).json({ message: "Failed to fetch pending professors" });
  }
});

// ✅ PATCH: Approve Professor
router.patch("/approve/:id", verifyAdmin, async (req, res) => {
  try {
    const prof = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).select("-password");

    if (!prof) return res.status(404).json({ message: "Professor not found" });

    res.json({ message: `✅ ${prof.name} approved successfully.`, professor: prof });
  } catch (err) {
    console.error("❌ Approval failed:", err.message);
    res.status(500).json({ message: "Failed to approve professor" });
  }
});

// ✅ DELETE: Reject Professor
router.delete("/reject/:id", verifyAdmin, async (req, res) => {
  try {
    const prof = await User.findByIdAndDelete(req.params.id);

    if (!prof) return res.status(404).json({ message: "Professor not found" });

    res.json({ message: `❌ ${prof.name} rejected and removed.` });
  } catch (err) {
    console.error("❌ Rejection failed:", err.message);
    res.status(500).json({ message: "Failed to reject professor" });
  }
});

export default router;
