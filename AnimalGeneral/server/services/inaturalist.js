import { getWikipediaSummary } from "./wikipedia.js";

const INATURALIST_API = "https://api.inaturalist.org/v1";

async function request(endpoint) {
  const response = await fetch(`${INATURALIST_API}${endpoint}`);

  if (!response.ok) {
    throw new Error(`iNaturalist API error: ${response.status}`);
  }

  return response.json();
}

function normalizeAnimal(taxon) {
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

    wikipediaUrl: taxon.wikipedia_url || null,

    inaturalistUrl: `https://www.inaturalist.org/taxa/${taxon.id}`,
  };
}

/*
 * Add information from Wikipedia.
 *
 * iNaturalist helps us discover the species.
 * Wikipedia gives us a human-readable description.
 */
async function enrichAnimal(animal) {
  const wikipedia = await getWikipediaSummary(animal.name);

  if (!wikipedia) {
    return {
      ...animal,

      description: "No description available.",
    };
  }

  return {
    ...animal,

    description:
      wikipedia.extract || wikipedia.description || "No description available.",

    wikipediaUrl: wikipedia.wikipediaUrl || animal.wikipediaUrl,

    // Prefer the Wikipedia image only
    // when iNaturalist doesn't have one.
    image: animal.image || wikipedia.image || null,
  };
}

/*
 * Search animal names.
 *
 * iNaturalist is used here for discovering
 * what species a user means by a common name.
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

      /*
       * Exact common-name match.
       *
       * "axolotl" → "Axolotl"
       */
      if (commonName === searchTerm) {
        score += 1000;
      }

      /*
       * Common name starts with query.
       */
      if (commonName.startsWith(searchTerm)) {
        score += 500;
      }

      /*
       * Query appears anywhere
       * in common name.
       */
      if (commonName.includes(searchTerm)) {
        score += 200;
      }

      /*
       * Exact scientific-name match.
       */
      if (scientificName === searchTerm) {
        score += 1000;
      }

      /*
       * Scientific name contains query.
       */
      if (scientificName.includes(searchTerm)) {
        score += 100;
      }

      /*
       * Keep iNaturalist's original relevance
       * as a small tie-breaker.
       */
      score += Math.max(0, 50 - index);

      return {
        taxon,
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 24)
    .map(({ taxon }) => normalizeAnimal(taxon));

  /*
   * Get Wikipedia information for each result.
   *
   * Promise.all allows the requests to happen
   * concurrently instead of one after another.
   */
  const enrichedAnimals = await Promise.all(animals.map(enrichAnimal));

  return enrichedAnimals;
}

/*
 * Featured animals.
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

  const animals = data.results.map(normalizeAnimal);

  const enrichedAnimals = await Promise.all(animals.map(enrichAnimal));

  return enrichedAnimals;
}
