// backend/routes/admin.js
import express from "express";
import {
  getPendingProfessors,
  approveProfessor,
  rejectProfessor,
} from "../controllers/authController.js";

const router = express.Router();

// Get all pending professors
router.get("/pending-professors", getPendingProfessors);

// Approve a professor
router.patch("/approve/:id", approveProfessor);

// Reject a professor
router.delete("/reject/:id", rejectProfessor);

export default router;
