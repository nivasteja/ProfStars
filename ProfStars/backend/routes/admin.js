// backend/routes/admin.js
import express from "express";
import {
  getPendingProfessors,
  approveProfessor,
  rejectProfessor,
} from "../controllers/authController.js";

const router = express.Router();

/**
 * ============================================
 * ADMIN ROUTES
 * ============================================
 */

// 🟢 Get all pending professors (awaiting approval)
router.get("/pending-professors", async (req, res) => {
  try {
    const result = await getPendingProfessors(req, res);
    return result;
  } catch (error) {
    console.error("❌ Error in GET /pending-professors:", error.message);
    res.status(500).json({ message: "Failed to fetch pending professors." });
  }
});

// 🟢 Approve a professor by ID
router.patch("/approve/:id", async (req, res) => {
  try {
    const result = await approveProfessor(req, res);
    return result;
  } catch (error) {
    console.error("❌ Error in PATCH /approve/:id:", error.message);
    res.status(500).json({ message: "Failed to approve professor." });
  }
});

// 🔴 Reject (delete) a professor by ID
router.delete("/reject/:id", async (req, res) => {
  try {
    const result = await rejectProfessor(req, res);
    return result;
  } catch (error) {
    console.error("❌ Error in DELETE /reject/:id:", error.message);
    res.status(500).json({ message: "Failed to reject professor." });
  }
});

export default router;
