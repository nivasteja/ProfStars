// backend/controllers/authController.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * ============================================
 * REGISTER CONTROLLER
 * Handles Student and Professor Registration
 * ============================================
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered." });
    }

    // Hash password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with approval flag
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      // Professors require admin approval before login
      isApproved: role !== "professor",
    });

    await newUser.save();

    res.status(201).json({
      message:
        role === "professor"
          ? "Professor registered successfully. Awaiting admin approval."
          : "Student registration successful!",
    });
  } catch (error) {
    console.error("❌ Error in registerUser:", error.message);
    res.status(500).json({
      message: "Registration failed. Please try again later.",
      error: error.message,
    });
  }
};

/**
 * ============================================
 * LOGIN CONTROLLER
 * Handles Login for All Roles
 * ============================================
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: "Please enter email and password." });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Check professor approval status
    if (user.role === "professor" && !user.isApproved) {
      return res.status(403).json({
        message: "Professor account pending admin approval.",
      });
    }

    // Generate signed JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful!",
      token,
      role: user.role,
      name: user.name,
    });
  } catch (error) {
    console.error("❌ Error in loginUser:", error.message);
    res.status(500).json({
      message: "Login failed. Please try again later.",
      error: error.message,
    });
  }
};

/**
 * ============================================
 * ADMIN APPROVAL CONTROLLERS
 * Approve or Reject Professors
 * ============================================
 */
export const getPendingProfessors = async (req, res) => {
  try {
    const pending = await User.find({ role: "professor", isApproved: false });
    res.status(200).json(pending);
  } catch (error) {
    console.error("❌ Error in getPendingProfessors:", error.message);
    res.status(500).json({ message: "Failed to fetch pending professors." });
  }
};

export const approveProfessor = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await User.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Professor not found." });
    }

    res.status(200).json({ message: "Professor approved successfully!" });
  } catch (error) {
    console.error("❌ Error in approveProfessor:", error.message);
    res.status(500).json({ message: "Failed to approve professor." });
  }
};

export const rejectProfessor = async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await User.findByIdAndDelete(id);

    if (!removed) {
      return res.status(404).json({ message: "Professor not found." });
    }

    res.status(200).json({ message: "Professor rejected and removed." });
  } catch (error) {
    console.error("❌ Error in rejectProfessor:", error.message);
    res.status(500).json({ message: "Failed to reject professor." });
  }
};
