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

async function enrichAnimal(animal) {
  /*
   * Try EOL first because it is designed
   * specifically around biodiversity information.
   */
  const eol = await searchEOL(animal.scientificName);

  if (eol?.text) {
    return {
      ...animal,

      description: eol.text,

      descriptionSource: eol.source || "Encyclopedia of Life",

      descriptionSourceUrl: eol.sourceUrl || null,
    };
  }

  /*
   * If EOL doesn't have useful information,
   * try Wikipedia using both common and
   * scientific names.
   */
  const wikipedia = await getWikipediaSummary(
    animal.name,
    animal.scientificName,
  );

  if (wikipedia) {
    return {
      ...animal,

      description:
        wikipedia.extract ||
        wikipedia.description ||
        "No description available.",

      descriptionSource: "Wikipedia",

      descriptionSourceUrl: wikipedia.wikipediaUrl || null,

      wikipediaUrl: wikipedia.wikipediaUrl || animal.wikipediaUrl,

      image: animal.image || wikipedia.image || null,
    };
  }

  /*
   * Nothing was found in either source.
   * We explicitly keep the missing state rather
   * than inventing information.
   */
  return {
    ...animal,

    description: "No description available.",

    descriptionSource: null,

    descriptionSourceUrl: null,
  };
}

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

  const enrichedAnimals = await Promise.all(animals.map(enrichAnimal));

  return enrichedAnimals;
}

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
