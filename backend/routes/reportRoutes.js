import express from "express";
import Report from "../models/Report.js";

const router = express.Router();

router.post("/add", async (req, res) => {
  try {
    const { targetName, targetType, reason, details } = req.body;

    if (!targetName || !reason)
      return res.status(400).json({ message: "Missing required fields" });

    const report = new Report({
      targetName,
      targetType,
      reason,
      details,
      status: "Pending",
    });

    await report.save();

    res.json({ message: "Report submitted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
