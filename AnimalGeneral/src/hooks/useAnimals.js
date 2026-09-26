import { useEffect, useState } from "react";

function useAnimals(query = "") {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const searchTerm = query.trim();

    if (!searchTerm) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();

    async function fetchAnimals() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/animals/search?q=${encodeURIComponent(searchTerm)}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Failed to fetch animals.");
        }

        const animals = (result.animals || []).map((animal) => ({
          ...animal,

          // Keep the names expected by the existing UI.
          category: animal.category || "Other",

          status: animal.status || "Information unavailable",

          location: animal.location || "Information unavailable",

          diet: animal.diet || "Information unavailable",

          description: animal.description || "No description available.",
        }));

        setData(animals);
      } catch (err) {
        if (err.name === "AbortError") {
          return;
        }

        console.error("Failed to fetch animals:", err);

        setError("Unable to load animals. Please try again.");

        setData([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchAnimals();

    return () => {
      controller.abort();
    };
  }, [query]);

  return {
    animals: data,
    loading,
    error,
  };
}

export default useAnimals;
