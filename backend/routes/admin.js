import express from "express";
import User from "../models/User.js";
import Professor from "../models/Professor.js";

const router = express.Router();

/* =======================================================
   ✅ Verify Admin Middleware
   ======================================================= */
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

/* =======================================================
   ✅ GET Professors by Status (public/admin use)
   ======================================================= */
router.get("/professors", verifyAdmin, async (req, res) => {
  try {
    const status = req.query.status || "pending";

    let filter = { role: "professor" };

    if (status === "approved") {
      filter.isApproved = true;
    } else if (status === "pending") {
      filter.isApproved = false;
      filter.email = { $not: /@pending\.profstars\.com$/i };
    } else if (status === "student-submitted") {
      filter.email = /@pending\.profstars\.com$/i;
      filter.isApproved = false;
    }

    const professors = await User.find(filter)
      .select("name email university department country createdAt isApproved")
      .sort({ createdAt: -1 });

    res.json(professors);
  } catch (error) {
    console.error("❌ Error fetching professors:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* =======================================================
   ✅ Approve Professor
   (Combined behavior of both files)
   ======================================================= */
router.put("/professor/approve/:id", verifyAdmin, async (req, res) => {
  try {
    const prof =
      (await User.findById(req.params.id)) ||
      (await Professor.findById(req.params.id));

    if (!prof) return res.status(404).json({ message: "Professor not found" });

    prof.isApproved = true;
    prof.status = "approved";

    await prof.save();

    res.json({
      message: "Professor approved successfully",
      professor: prof,
    });
  } catch (error) {
    console.error("❌ Error approving professor:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* =======================================================
   ❌ Reject Professor (soft reject)
   ======================================================= */
router.put("/professor/reject/:id", verifyAdmin, async (req, res) => {
  try {
    const prof =
      (await User.findById(req.params.id)) ||
      (await Professor.findById(req.params.id));

    if (!prof) return res.status(404).json({ message: "Professor not found" });

    prof.isApproved = false;
    prof.status = "rejected";

    await prof.save();

    res.json({
      message: "Professor rejected successfully",
      professor: prof,
    });
  } catch (error) {
    console.error("❌ Error rejecting professor:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* =======================================================
   🔥 Admin Only Routes
   ======================================================= */

// GET -- only pending professors
router.get("/pending-professors", verifyAdmin, async (req, res) => {
  try {
    const professors = await User.find({ role: "professor", isApproved: false })
      .sort({ createdAt: -1 })
      .select("-password");

    res.status(200).json(professors);
  } catch (err) {
    console.error("❌ Error fetching pending professors:", err.message);
    res.status(500).json({ message: "Failed to fetch pending professors" });
  }
});

// PATCH -- Approve (admin version)
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

// DELETE -- Permanent Reject (delete)
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
