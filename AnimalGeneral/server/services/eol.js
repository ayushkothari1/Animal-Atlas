const EOL_API = "https://eol.org/api";

async function request(endpoint, params = {}) {
  const searchParams = new URLSearchParams(params);

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 5000);

  try {
    const response = await fetch(
      `${EOL_API}${endpoint}?${searchParams.toString()}`,
      {
        headers: {
          "User-Agent": "AnimalAtlas/1.0",
        },
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      throw new Error(`EOL API error: ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function cleanText(text) {
  if (!text) {
    return null;
  }

  return String(text)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function getText(item) {
  return cleanText(
    item?.description || item?.objectURI || item?.dataValue || item?.value,
  );
}

function getMetadataText(item) {
  const fields = [
    item?.subject,
    item?.title,
    item?.name,
    item?.term,
    item?.predicate,
    item?.measurement,
    item?.value,
    item?.dataValue,
    item?.description,
  ];

  return fields
    .filter(Boolean)
    .map((value) => String(value).toLowerCase())
    .join(" ");
}

function findBestText(dataObjects, keywords) {
  const candidates = [];

  for (const item of dataObjects) {
    const text = getText(item);

    if (!text || text.length < 30) {
      continue;
    }

    const metadata = getMetadataText(item);

    const matchedKeywords = keywords.filter((keyword) =>
      metadata.includes(keyword),
    );

    if (matchedKeywords.length === 0) {
      continue;
    }

    let score = matchedKeywords.length * 10;

    if (item?.subject) {
      score += 5;
    }

    if (item?.title) {
      score += 5;
    }

    if (text.length >= 80) {
      score += 3;
    }

    candidates.push({
      text,
      score,
    });
  }

  candidates.sort((a, b) => b.score - a.score);

  return candidates[0]?.text || null;
}

function findGeneralDescription(dataObjects) {
  const candidates = [];

  for (const item of dataObjects) {
    const text = getText(item);

    if (!text || text.length < 80) {
      continue;
    }

    candidates.push(text);
  }

  candidates.sort((a, b) => {
    const aScore = a.length >= 150 && a.length <= 1200 ? 10 : 0;

    const bScore = b.length >= 150 && b.length <= 1200 ? 10 : 0;

    return bScore - aScore;
  });

  return candidates[0] || null;
}

function findSourceUrl(item) {
  return (
    item?.source ||
    item?.reference ||
    item?.source_url ||
    item?.identifier ||
    null
  );
}

function findBestItem(dataObjects, keywords) {
  const candidates = [];

  for (const item of dataObjects) {
    const text = getText(item);

    if (!text || text.length < 30) {
      continue;
    }

    const metadata = getMetadataText(item);

    const matchedKeywords = keywords.filter((keyword) =>
      metadata.includes(keyword),
    );

    if (!matchedKeywords.length) {
      continue;
    }

    candidates.push({
      item,
      text,
      score: matchedKeywords.length,
    });
  }

  candidates.sort((a, b) => b.score - a.score);

  return candidates[0] || null;
}

export async function searchEOL(scientificName) {
  if (!scientificName) {
    return null;
  }

  try {
    /*
     * Step 1:
     * Find the EOL species page.
     */
    const searchData = await request("/search/1.0.json", {
      q: scientificName,
      exact: "true",
      page: 1,
      count: 5,
    });

    const results = searchData?.results || [];

    if (!results.length) {
      return null;
    }

    const result = results[0];

    const pageId = result?.id;

    if (!pageId) {
      return null;
    }

    /*
     * Step 2:
     * Request the detailed EOL page.
     */
    const pageData = await request(`/pages/1.0/${pageId}.json`, {
      details: "true",
      images: "false",
      videos: "false",
      sounds: "false",
      maps: "false",
      text: "true",
      references: "true",
      taxonomy: "true",
    });

    const dataObjects = pageData?.dataObjects || [];

    /*
     * General description.
     */
    const description = findGeneralDescription(dataObjects);

    /*
     * Habitat / distribution / ecology.
     */
    const habitatItem = findBestItem(dataObjects, [
      "habitat",
      "distribution",
      "ecology",
      "environment",
      "range",
      "biome",
      "geographic range",
      "geographical range",
    ]);

    /*
     * Diet / feeding.
     */
    const dietItem = findBestItem(dataObjects, [
      "diet",
      "feeding",
      "food",
      "trophic",
      "nutrition",
      "foraging",
      "prey",
      "feeding behavior",
    ]);

    /*
     * Conservation.
     */
    const conservationItem = findBestItem(dataObjects, [
      "conservation",
      "threat",
      "iucn",
      "red list",
      "endangered",
      "vulnerable",
      "population status",
    ]);

    return {
      description,

      habitat: habitatItem?.text || null,

      diet: dietItem?.text || null,

      conservation: conservationItem?.text || null,

      habitatSource: findSourceUrl(habitatItem?.item),

      dietSource: findSourceUrl(dietItem?.item),

      conservationSource: findSourceUrl(conservationItem?.item),

      source: "Encyclopedia of Life",

      sourceUrl: `https://eol.org/pages/${pageId}`,
    };
  } catch (error) {
    if (error.name === "AbortError") {
      console.error("EOL request timed out.");
    } else {
      console.error("EOL API error:", error.message);
    }

    return null;
  }
}
