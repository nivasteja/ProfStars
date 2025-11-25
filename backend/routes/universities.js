import express from "express";
import axios from "axios";
import countries from "../data/countries.js";
import University from "../models/University.js";

const router = express.Router();

/* ============================================================
   1️⃣  GET /universities/countries
   Returns list of countries (static)
   ============================================================ */
router.get("/countries", (req, res) => {
  res.json(countries);
});

/* ============================================================
   2️⃣  GET /universities/:country
   Fast version — NO GEOLOOKUP
   Fetches:
   - Hipolabs API universities
   - MongoDB custom universities
   Merges them (no duplicates)
   ============================================================ */
router.get("/:country", async (req, res) => {
  try {
    const country = req.params.country;

    /* 💠 A. FETCH Hipolabs universities */
    let apiUniversities = [];
    try {
      const response = await axios.get(
        `http://universities.hipolabs.com/search?country=${encodeURIComponent(
          country
        )}`,
        { timeout: 8000 }
      );
      apiUniversities = response.data || [];
    } catch (err) {
      console.log("⚠ Hipolabs API failed. Using DB universities only.");
    }

    /* 💠 B. FETCH custom MongoDB universities */
    const dbUniversities = await University.find({ country }).lean();

    /* 💠 C. MERGE — AVOID duplicates */
    let merged = [...apiUniversities];

    dbUniversities.forEach((dbUni) => {
      const exists = apiUniversities.some(
        (apiUni) => apiUni.name.toLowerCase() === dbUni.name.toLowerCase()
      );

      if (!exists) {
        merged.push({
          name: dbUni.name,
          country: dbUni.country,
          domains: [],
          web_pages: [],
          alpha_two_code: dbUni.country.slice(0, 2).toUpperCase(),
        });
      }
    });

    /* 💠 D. RETURN (NO coordinates) */
    res.json(merged);
  } catch (error) {
    console.error("Error fetching universities:", error.message);
    res.status(500).json({
      message: "Failed to fetch universities",
      error: error.message,
    });
  }
});

/* ============================================================
   3️⃣  POST /universities/add
   Adds new university to DB
   ============================================================ */
router.post("/add", async (req, res) => {
  try {
    const { name, country } = req.body;

    if (!name || !country) {
      return res
        .status(400)
        .json({ message: "Name and country are required." });
    }

    const exists = await University.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      country,
    });

    if (exists) {
      return res.json({
        message: "University already exists.",
        university: exists,
      });
    }

    const newUniversity = new University({ name, country });
    await newUniversity.save();

    res.status(201).json({
      message: "University added successfully.",
      university: newUniversity,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add university",
      error: error.message,
    });
  }
});

export default router;
