const WIKIPEDIA_API = "https://en.wikipedia.org/api/rest_v1";

const WIKIPEDIA_ACTION_API = "https://en.wikipedia.org/w/api.php";

function createWikipediaTitle(name) {
  return encodeURIComponent(name.trim().replace(/\s+/g, "_"));
}

async function getExactSummary(name) {
  try {
    const title = createWikipediaTitle(name);

    const response = await fetch(`${WIKIPEDIA_API}/page/summary/${title}`, {
      headers: {
        "User-Agent": "AnimalAtlas/1.0 (animal information explorer)",
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (
      !data ||
      data.type === "https://mediawiki.org/wiki/HyperSwitch/errors/not_found"
    ) {
      return null;
    }

    return {
      title: data.title || null,

      description: data.description || null,

      extract: data.extract || null,

      image: data.originalimage?.source || data.thumbnail?.source || null,

      wikipediaUrl: data.content_urls?.desktop?.page || null,
    };
  } catch (error) {
    console.error("Wikipedia exact lookup error:", error.message);

    return null;
  }
}

async function searchWikipedia(name) {
  try {
    const searchParams = new URLSearchParams({
      action: "query",
      list: "search",
      srsearch: `"${name}" animal`,
      srlimit: "5",
      format: "json",
      origin: "*",
    });

    const response = await fetch(
      `${WIKIPEDIA_ACTION_API}?${searchParams.toString()}`,
      {
        headers: {
          "User-Agent": "AnimalAtlas/1.0 (animal information explorer)",
        },
      },
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    return data?.query?.search || [];
  } catch (error) {
    console.error("Wikipedia search error:", error.message);

    return [];
  }
}

async function getSummaryFromSearch(name) {
  const results = await searchWikipedia(name);

  if (!results.length) {
    return null;
  }

  /*
   * Try the most relevant Wikipedia search
   * results until we find an actual article
   * with useful content.
   */
  for (const result of results) {
    const summary = await getExactSummary(result.title);

    if (summary && (summary.extract || summary.description)) {
      return summary;
    }
  }

  return null;
}

export async function getWikipediaSummary(name, scientificName = null) {
  if (!name && !scientificName) {
    return null;
  }

  /*
   * Strategy 1:
   * Try the common name first.
   */
  if (name) {
    const exactCommon = await getExactSummary(name);

    if (exactCommon && (exactCommon.extract || exactCommon.description)) {
      return exactCommon;
    }
  }

  /*
   * Strategy 2:
   * Try the scientific name.
   */
  if (scientificName && scientificName !== name) {
    const exactScientific = await getExactSummary(scientificName);

    if (
      exactScientific &&
      (exactScientific.extract || exactScientific.description)
    ) {
      return exactScientific;
    }
  }

  /*
   * Strategy 3:
   * Search Wikipedia when an exact
   * article title doesn't exist.
   */
  if (name) {
    const searched = await getSummaryFromSearch(name);

    if (searched) {
      return searched;
    }
  }

  /*
   * Strategy 4:
   * Search using the scientific name.
   */
  if (scientificName && scientificName !== name) {
    const searched = await getSummaryFromSearch(scientificName);

    if (searched) {
      return searched;
    }
  }

  return null;
}
