import express from "express";
import Professor from "../models/Professor.js";
import User from "../models/User.js";

const router = express.Router();

/* =======================================================
   ✅ Get Professors by Status
   ======================================================= */
router.get("/professors", async (req, res) => {
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
      filter.isApproved = false; // 🔥 important fix
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
   ======================================================= */
router.put("/professor/approve/:id", async (req, res) => {
  try {
    let prof =
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
   ❌ Reject Professor
   ======================================================= */
router.put("/professor/reject/:id", async (req, res) => {
  try {
    let prof =
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

export default router;
