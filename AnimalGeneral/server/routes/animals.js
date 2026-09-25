import express from "express";

import { searchAnimals, getFeaturedAnimals } from "../services/inaturalist.js";

const router = express.Router();

router.get("/search", async (req, res) => {
  try {
    const query = String(req.query.q || "").trim();

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required.",
      });
    }

    const animals = await searchAnimals(query);

    res.json({
      success: true,
      query,
      count: animals.length,
      animals,
    });
  } catch (error) {
    console.error("Animal search error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to search animals.",
    });
  }
});

router.get("/featured", async (req, res) => {
  try {
    const animals = await getFeaturedAnimals();

    res.json({
      success: true,
      count: animals.length,
      animals,
    });
  } catch (error) {
    console.error("Featured animals error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch featured animals.",
    });
  }
});

export default router;
