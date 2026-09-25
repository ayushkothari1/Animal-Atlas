import { useEffect, useState } from "react";

const STORAGE_KEY = "animal-atlas-favorites";

function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = (id) => {
    return favorites.some((animal) => animal.id === id);
  };

  const toggleFavorite = (animal) => {
    setFavorites((current) => {
      const exists = current.some((item) => item.id === animal.id);

      if (exists) {
        return current.filter((item) => item.id !== animal.id);
      }

      return [...current, animal];
    });
  };

  return {
    favorites,
    toggleFavorite,
    isFavorite,
  };
}

export default useFavorites;
