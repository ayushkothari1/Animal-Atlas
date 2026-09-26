import { getWikipediaSummary } from "./wikipedia.js";
import { searchEOL } from "./eol.js";

const INATURALIST_API = "https://api.inaturalist.org/v1";

async function request(endpoint) {
  const response = await fetch(`${INATURALIST_API}${endpoint}`);

  if (!response.ok) {
    throw new Error(`iNaturalist API error: ${response.status}`);
  }

  return response.json();
}

function normalizeAnimal(taxon) {
  const conservationStatus = taxon.conservation_status;

  return {
    id: taxon.id,

    name: taxon.preferred_common_name || taxon.name,

    scientificName: taxon.name,

    category: taxon.iconic_taxon_name || "Other",

    rank: taxon.rank || null,

    observations: taxon.observations_count || 0,

    image:
      taxon.default_photo?.medium_url ||
      taxon.default_photo?.square_url ||
      null,

    conservation:
      conservationStatus?.status_name ||
      conservationStatus?.iucn_status_name ||
      null,

    wikipediaUrl: taxon.wikipedia_url || null,

    inaturalistUrl: `https://www.inaturalist.org/taxa/${taxon.id}`,

    description: null,

    habitat: null,

    diet: null,
  };
}

/*
 * Search only.
 *
 * IMPORTANT:
 * This function does NOT call EOL or Wikipedia.
 * That keeps search fast.
 */
export async function searchAnimals(query) {
  const params = new URLSearchParams({
    q: query,
    rank: "species",
    per_page: "50",
  });

  const data = await request(`/taxa?${params.toString()}`);

  const searchTerm = query.trim().toLowerCase();

  const animals = data.results
    .filter((taxon) => {
      const icon = taxon.iconic_taxon_name;

      return [
        "Mammalia",
        "Aves",
        "Reptilia",
        "Amphibia",
        "Actinopterygii",
        "Arachnida",
        "Insecta",
        "Mollusca",
        "Crustacea",
        "Animalia",
      ].includes(icon);
    })
    .map((taxon, index) => {
      const commonName = String(
        taxon.preferred_common_name || "",
      ).toLowerCase();

      const scientificName = String(taxon.name || "").toLowerCase();

      let score = 0;

      if (commonName === searchTerm) {
        score += 1000;
      }

      if (commonName.startsWith(searchTerm)) {
        score += 500;
      }

      if (commonName.includes(searchTerm)) {
        score += 200;
      }

      if (scientificName === searchTerm) {
        score += 1000;
      }

      if (scientificName.includes(searchTerm)) {
        score += 100;
      }

      score += Math.max(0, 50 - index);

      return {
        taxon,
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 24)
    .map(({ taxon }) => normalizeAnimal(taxon));

  return animals;
}

/*
 * Fetch one detailed animal.
 *
 * This is where we can safely use:
 *
 * iNaturalist
 * EOL
 * Wikipedia
 *
 * because this happens for ONE animal,
 * not 24 animals at once.
 */
export async function getAnimalDetails(animalId) {
  const data = await request(`/taxa/${animalId}`);

  const taxon = data?.results?.[0];

  if (!taxon) {
    return null;
  }

  const animal = normalizeAnimal(taxon);

  /*
   * Try EOL for habitat, diet,
   * description and other biodiversity data.
   */
  let eol = null;

  try {
    eol = await searchEOL(animal.scientificName);
  } catch (error) {
    console.error("EOL details error:", error.message);
  }

  /*
   * Start with EOL information.
   */
  if (eol) {
    animal.description = eol.description || null;

    animal.habitat = eol.habitat || null;

    animal.diet = eol.diet || null;

    animal.conservation = animal.conservation || eol.conservation || null;

    animal.descriptionSource = eol.description
      ? eol.descriptionSource || "Encyclopedia of Life"
      : null;

    animal.habitatSource = eol.habitat
      ? eol.habitatSource || "Encyclopedia of Life"
      : null;

    animal.dietSource = eol.diet
      ? eol.dietSource || "Encyclopedia of Life"
      : null;
  }

  /*
   * If EOL didn't provide a description,
   * try Wikipedia.
   */
  if (!animal.description) {
    try {
      const wikipedia = await getWikipediaSummary(
        animal.name,
        animal.scientificName,
      );

      if (wikipedia) {
        animal.description = wikipedia.extract || wikipedia.description || null;

        animal.descriptionSource = animal.description ? "Wikipedia" : null;

        animal.wikipediaUrl = wikipedia.wikipediaUrl || animal.wikipediaUrl;

        animal.image = animal.image || wikipedia.image || null;
      }
    } catch (error) {
      console.error("Wikipedia details error:", error.message);
    }
  }

  return animal;
}

/*
 * Featured animals.
 *
 * For now we use iNaturalist only so
 * the homepage remains fast.
 */
export async function getFeaturedAnimals() {
  const params = new URLSearchParams({
    rank: "species",

    iconic_taxa: "Mammalia,Aves,Reptilia,Amphibia,Actinopterygii",

    per_page: "24",

    order_by: "observations_count",

    order: "desc",
  });

  const data = await request(`/taxa?${params.toString()}`);

  return data.results.map(normalizeAnimal);
}
