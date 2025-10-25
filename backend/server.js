// backend/server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import professorRoutes from "./routes/professor.js";
import reviewRoutes from "./routes/review.js";
import adminAnalyticsRoutes from "./routes/adminAnalytics.js";
import professorAnalytics from "./routes/professorAnalytics.js";
import universitiesRoutes from "./routes/universities.js"; // ✅ ADD THIS

dotenv.config();
const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/professor", professorRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);
app.use("/api/professor/analytics", professorAnalytics);
app.use("/api/universities", universitiesRoutes); // ✅ ADD THIS

// Test route
app.get("/", (req, res) => res.send("ProfStars API running..."));

// Database
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err.message));

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
