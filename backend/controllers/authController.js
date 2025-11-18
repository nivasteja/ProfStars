// backend/controllers/authController.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      country,
      university,
      department,
      academicTitle,
      experienceYears,
      major,
    } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    // Check if already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered." });
    }

    // Determine user role automatically if needed
    let userRole = role || "student";
    if (/@profstars\.(in|com|ca)$/i.test(email)) {
      userRole = "admin";
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 8);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: userRole,
      country,
      university,
      department,
      academicTitle,
      experienceYears,
      major,
      isApproved: userRole !== "professor",
    });

    await newUser.save();

    // Success response
    let message;
    if (userRole === "admin") {
      message = "Admin account created successfully.";
    } else if (userRole === "professor") {
      message = "Professor registration successful. Awaiting admin approval.";
    } else {
      message = "Student registration successful.";
    }

    res.status(201).json({ message });
  } catch (error) {
    console.error("❌ Error in registerUser:", error.message);
    res.status(500).json({
      message: "Registration failed. Please try again later.",
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password." });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials." });

    // Ensure admin domain enforcement
    if (/@profstars\.(in|com|ca)$/i.test(email)) user.role = "admin";

    // Professors must be approved
    if (user.role === "professor" && !user.isApproved) {
      return res
        .status(403)
        .json({ message: "Professor account pending admin approval." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: `Login successful as ${user.role}.`,
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

    if (!updated)
      return res.status(404).json({ message: "Professor not found." });

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

    if (!removed)
      return res.status(404).json({ message: "Professor not found." });

    res.status(200).json({ message: "Professor rejected and removed." });
  } catch (error) {
    console.error("❌ Error in rejectProfessor:", error.message);
    res.status(500).json({ message: "Failed to reject professor." });
  }
};
