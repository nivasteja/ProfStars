// backend/routes/report.js
import express from "express";
import Report from "../models/Report.js";
const router = express.Router();

/**
 * POST /api/report
 * body: { targetType, targetName, targetId?, reason, details?, email? }
 */
router.post("/", async (req, res) => {
  try {
    const { targetType, targetName, targetId, reason, details, email } = req.body;
    if (!targetType || !targetName || !reason) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    const doc = await Report.create({ targetType, targetName, targetId, reason, details, email });
    return res.status(201).json({ message: "Report saved.", reportId: doc._id });
  } catch (err) {
    console.error("Report error:", err.message);
    return res.status(500).json({ message: "Server error." });
  }
});

export default router;
