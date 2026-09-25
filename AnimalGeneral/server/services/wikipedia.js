const WIKIPEDIA_API = "https://en.wikipedia.org/api/rest_v1";

function createWikipediaTitle(name) {
  return encodeURIComponent(name.trim().replace(/\s+/g, "_"));
}

export async function getWikipediaSummary(name) {
  try {
    const title = createWikipediaTitle(name);

    const response = await fetch(`${WIKIPEDIA_API}/page/summary/${title}`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return {
      title: data.title || null,

      description: data.description || null,

      extract: data.extract || null,

      image: data.originalimage?.source || data.thumbnail?.source || null,

      wikipediaUrl: data.content_urls?.desktop?.page || null,
    };
  } catch (error) {
    console.error("Wikipedia API error:", error.message);

    return null;
  }
}
