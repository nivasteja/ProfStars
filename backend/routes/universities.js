import express from "express";
import axios from "axios";
import countries from "../data/countries.js";
import University from "../models/University.js";

const router = express.Router();

// Get all countries
router.get("/countries", (req, res) => {
  res.json(countries);
});

// Get universities by country (API + Database)
router.get("/:country", async (req, res) => {
  try {
    const country = req.params.country;

    // Fetch from Hipolabs API
    let apiUniversities = [];
    try {
      const response = await axios.get(
        `http://universities.hipolabs.com/search?country=${encodeURIComponent(
          country
        )}`,
        { timeout: 10000 }
      );
      apiUniversities = response.data;
    } catch (apiError) {
      console.log("API fetch failed, continuing with DB only");
    }

    // Fetch custom universities from database
    const dbUniversities = await University.find({ country }).lean();

    // Merge both sources (remove duplicates)
    const allUniversities = [...apiUniversities];

    dbUniversities.forEach((dbUni) => {
      const exists = apiUniversities.some(
        (apiUni) => apiUni.name.toLowerCase() === dbUni.name.toLowerCase()
      );
      if (!exists) {
        allUniversities.push({
          name: dbUni.name,
          country: dbUni.country,
          domains: [],
          web_pages: [],
          alpha_two_code: "",
        });
      }
    });

    res.json(allUniversities);
  } catch (error) {
    console.error("Error fetching universities:", error.message);
    res.status(500).json({
      message: "Failed to fetch universities",
      error: error.message,
    });
  }
});

// Add new custom university
router.post("/add", async (req, res) => {
  try {
    const { name, country } = req.body;

    if (!name || !country) {
      return res.status(400).json({ message: "Name and country are required" });
    }

    // Check if already exists
    const exists = await University.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      country,
    });

    if (exists) {
      return res.json({
        message: "University already exists",
        university: exists,
      });
    }

    // Create new university
    const newUniversity = new University({ name, country });
    await newUniversity.save();

    res.status(201).json({
      message: "University added successfully",
      university: newUniversity,
    });
  } catch (error) {
    console.error("Error adding university:", error.message);
    res.status(500).json({
      message: "Failed to add university",
      error: error.message,
    });
  }
});

export default router;
