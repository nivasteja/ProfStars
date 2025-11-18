import express from "express";
import axios from "axios";
import countries from "../data/countries.js";
import University from "../models/University.js";

const router = express.Router();

/* ============================================================
   1️⃣  GET /universities/countries
   Returns list of countries from your static file
   ============================================================ */
router.get("/countries", (req, res) => {
  res.json(countries);
});

/* ============================================================
   GEO: Convert University Name → Coordinates (lat/lon)
   Using OpenStreetMap (Nominatim)
   ============================================================ */
async function getCoordinates(universityName, country) {
  try {
    const res = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: `${universityName}, ${country}`,
          format: "json",
          limit: 1,
        },
        headers: {
          "User-Agent": "ProfStars-App/1.0 (contact@example.com)"
        }
      }
    );

    if (res.data.length > 0) {
      return {
        lat: parseFloat(res.data[0].lat),
        lon: parseFloat(res.data[0].lon),
      };
    }
  } catch (err) {
    console.log("Geocoding failed for:", universityName);
  }

  return { lat: null, lon: null };
}

/* ============================================================
   2️⃣  GET /universities/:country
   Fetches from:
   - Hipolabs API
   - MongoDB Custom Universities
   Adds: lat & lon for map usage
   ============================================================ */
router.get("/:country", async (req, res) => {
  try {
    const country = req.params.country;

    /* ------------------------------
       A. Fetch Hipolabs API data
       ------------------------------ */
    let apiUniversities = [];
    try {
      const response = await axios.get(
        `http://universities.hipolabs.com/search?country=${encodeURIComponent(country)}`,
        { timeout: 10000 }
      );
      apiUniversities = response.data;
    } catch {
      console.log("Hipolabs API failed — using DB only.");
    }

    /* ------------------------------
       B. Fetch custom MongoDB universities
       ------------------------------ */
    const dbUniversities = await University.find({ country }).lean();

    /* ------------------------------
       C. Merge datasets (avoid duplicates)
       ------------------------------ */
    let allUniversities = [...apiUniversities];

    dbUniversities.forEach((dbUni) => {
      const exists = apiUniversities.some(
        (apiUni) =>
          apiUni.name.toLowerCase() === dbUni.name.toLowerCase()
      );

      if (!exists) {
        allUniversities.push({
          name: dbUni.name,
          country: dbUni.country,
          domains: [],
          web_pages: [],
          alpha_two_code: dbUni.country.slice(0, 2).toUpperCase(),
        });
      }
    });

    /* ------------------------------
       D. Add coordinates to each university
       ------------------------------ */
    const universitiesWithCoords = await Promise.all(
      allUniversities.map(async (uni) => {
        const coords = await getCoordinates(uni.name, uni.country);
        return {
          ...uni,
          lat: coords.lat,
          lon: coords.lon,
        };
      })
    );

    res.json(universitiesWithCoords);
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
   Add custom university into MongoDB
   ============================================================ */
router.post("/add", async (req, res) => {
  try {
    const { name, country } = req.body;

    if (!name || !country) {
      return res.status(400).json({ message: "Name and country are required." });
    }

    // Check if exists
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

    // Create new entry
    const newUniversity = new University({ name, country });
    await newUniversity.save();

    res.status(201).json({
      message: "University added successfully.",
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
