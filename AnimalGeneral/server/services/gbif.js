const GBIF_API = "https://api.gbif.org/v1";

async function request(endpoint) {
  const response = await fetch(`${GBIF_API}${endpoint}`);

  if (!response.ok) {
    throw new Error(`GBIF API error: ${response.status}`);
  }

  return response.json();
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function getCategory(className) {
  const value = normalizeText(className);

  if (value === "mammalia") return "Mammals";
  if (value === "aves") return "Birds";
  if (value === "reptilia") return "Reptiles";
  if (value === "amphibia") return "Amphibians";
  if (value === "actinopterygii") return "Fish";

  if (
    [
      "insecta",
      "arachnida",
      "mollusca",
      "crustacea",
      "chilopoda",
      "diplopoda",
    ].includes(value)
  ) {
    return "Invertebrates";
  }

  return "Other";
}

function normalizeSpecies(species) {
  const scientificName =
    species.canonicalName || species.scientificName || species.name;

  return {
    id: species.key,

    name: species.vernacularName || scientificName,

    scientificName,

    category: getCategory(species.class),

    rank: species.rank || null,

    kingdom: species.kingdom || null,
    phylum: species.phylum || null,
    class: species.class || null,
    order: species.order || null,
    family: species.family || null,
    genus: species.genus || null,

    canonicalName: scientificName,

    gbifUrl: `https://www.gbif.org/species/${species.key}`,
  };
}

function isAnimal(species) {
  const kingdom = normalizeText(species.kingdom);
  const phylum = normalizeText(species.phylum);
  const className = normalizeText(species.class);

  const animalClasses = [
    "mammalia",
    "aves",
    "reptilia",
    "amphibia",
    "actinopterygii",
    "insecta",
    "arachnida",
    "mollusca",
    "crustacea",
    "chilopoda",
    "diplopoda",
  ];

  return (
    kingdom === "animalia" ||
    phylum === "chordata" ||
    animalClasses.includes(className)
  );
}

async function matchSpecies(query) {
  const params = new URLSearchParams({
    name: query,
  });

  return request(`/species/match?${params.toString()}`);
}

async function searchSpeciesFallback(query) {
  const params = new URLSearchParams({
    q: query,
    rank: "SPECIES",
    limit: "100",
  });

  return request(`/species/search?${params.toString()}`);
}

export async function searchSpecies(query) {
  const searchTerm = query.trim();

  if (!searchTerm) {
    return [];
  }

  /*
   * --------------------------------------------------
   * 1. Try GBIF exact species/name matching first
   * --------------------------------------------------
   */

  const match = await matchSpecies(searchTerm);

  if (
    match &&
    match.matchType !== "NONE" &&
    match.usageKey &&
    isAnimal(match)
  ) {
    const exactAnimal = normalizeSpecies({
      ...match,
      key: match.usageKey,
      canonicalName: match.canonicalName || match.scientificName || match.name,
    });

    return [exactAnimal];
  }

  /*
   * --------------------------------------------------
   * 2. Fallback to broader GBIF search
   * --------------------------------------------------
   */

  const data = await searchSpeciesFallback(searchTerm);

  const uniqueSpecies = new Map();

  for (const species of data.results) {
    if (!isAnimal(species)) {
      continue;
    }

    if (species.rank && species.rank.toUpperCase() !== "SPECIES") {
      continue;
    }

    const normalized = normalizeSpecies(species);

    if (!normalized.scientificName) {
      continue;
    }

    /*
     * Remove duplicate scientific names.
     */
    const key = normalizeText(normalized.scientificName);

    if (!uniqueSpecies.has(key)) {
      uniqueSpecies.set(key, normalized);
    }
  }

  return Array.from(uniqueSpecies.values()).slice(0, 24);
}
