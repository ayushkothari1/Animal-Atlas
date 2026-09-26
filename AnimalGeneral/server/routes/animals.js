import express from "express";

import { searchAnimals, getAnimalDetails } from "../services/inaturalist.js";

const router = express.Router();

/*
 * Search animals
 *
 * This endpoint intentionally returns only
 * fast iNaturalist search results.
 *
 * We do NOT call EOL or Wikipedia here.
 */
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

/*
 * Detailed animal profile
 *
 * EOL, Wikipedia and other detailed
 * information will be fetched here.
 */
router.get("/:id", async (req, res) => {
  try {
    const animalId = String(req.params.id).trim();

    if (!animalId) {
      return res.status(400).json({
        success: false,
        message: "Animal ID is required.",
      });
    }

    const animal = await getAnimalDetails(animalId);

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: "Animal not found.",
      });
    }

    res.json({
      success: true,
      animal,
    });
  } catch (error) {
    console.error("Animal details error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch animal details.",
    });
  }
});

/*
 * Featured animals
 */
router.get("/featured", async (req, res) => {
  try {
    const animals = await searchAnimals("animal");

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
