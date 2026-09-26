const EOL_API = "https://eol.org/api";

async function request(endpoint, params = {}) {
  const searchParams = new URLSearchParams(params);

  const response = await fetch(
    `${EOL_API}${endpoint}?${searchParams.toString()}`,
    {
      headers: {
        "User-Agent": "AnimalAtlas/1.0 (animal information explorer)",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`EOL API error: ${response.status}`);
  }

  return response.json();
}

function cleanText(text) {
  if (!text) {
    return null;
  }

  return String(text)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractDescription(data) {
  const pages = data?.results || [];

  for (const page of pages) {
    const sections = page?.dataObjects || [];

    for (const item of sections) {
      const text = cleanText(item?.description);

      if (text && text.length > 80) {
        return {
          text,
          source:
            item?.agents?.[0]?.full_name ||
            item?.source ||
            "Encyclopedia of Life",

          sourceUrl:
            item?.source_url || page?.identifier
              ? `https://eol.org/pages/${page.identifier}`
              : null,
        };
      }
    }
  }

  return null;
}

export async function searchEOL(scientificName) {
  if (!scientificName) {
    return null;
  }

  try {
    /*
     * First find the EOL page associated
     * with the scientific name.
     */
    const searchData = await request("/search", {
      q: scientificName,
      exact: "true",
      page: 1,
      count: 5,
    });

    const results = searchData?.results || [];

    if (!results.length) {
      return null;
    }

    /*
     * Get detailed information from the
     * most relevant EOL result.
     */
    const firstResult = results[0];

    const identifier = firstResult?.id || firstResult?.identifier;

    if (!identifier) {
      return null;
    }

    const pageData = await request(`/pages/${identifier}/data`, {
      taxonomy: "true",
      images: "false",
      videos: "false",
      sounds: "false",
      maps: "false",
      text: "true",
      details: "true",
      references: "false",
    });

    return extractDescription(pageData);
  } catch (error) {
    console.error("EOL API error:", error.message);

    return null;
  }
}
