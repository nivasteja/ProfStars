// backend/routes/auth.js
// Clean ES-module version with admin login integrated
import express from "express";
import jwt from "jsonwebtoken";
import { registerUser, loginUser } from "../controllers/authController.js";

const router = express.Router();

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = [
  {
    email: "admin@profstars.com",
    password: "Admin@123",
    name: "Admin User",
  },
  {
    email: "superadmin@profstars.ca",
    password: "Super@456",
    name: "Super Admin",
  },
  {
    email: "root@profstars.in",
    password: "Root@789",
    name: "Root Admin",
  },
];

// Register new user
router.post("/register", registerUser);

// Login existing user
router.post("/login", loginUser);

// Admin Login Route - NEW
router.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find matching admin credentials
    const admin = ADMIN_CREDENTIALS.find(
      (cred) => cred.email === email && cred.password === password
    );

    if (!admin) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        email: admin.email,
        role: "admin",
        name: admin.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      role: "admin",
      name: admin.name,
      email: admin.email,
    });
  } catch (error) {
    console.error("❌ Admin login error:", error);
    res.status(500).json({ message: "Server error during admin login" });
  }
});

export default router;
