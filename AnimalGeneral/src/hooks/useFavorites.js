import { useEffect, useState } from "react";

const STORAGE_KEY = "animal-atlas-favorites";

function loadFavorites() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to load favorites:", error);

    return [];
  }
}

function saveFavorites(favorites) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error("Failed to save favorites:", error);
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(loadFavorites);

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  const isFavorite = (animalId) => {
    return favorites.some((animal) => String(animal.id) === String(animalId));
  };

  const toggleFavorite = (animal) => {
    setFavorites((currentFavorites) => {
      const alreadyFavorite = currentFavorites.some(
        (item) => String(item.id) === String(animal.id),
      );

      if (alreadyFavorite) {
        return currentFavorites.filter(
          (item) => String(item.id) !== String(animal.id),
        );
      }

      return [...currentFavorites, animal];
    });
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    clearFavorites,
    favoriteCount: favorites.length,
  };
}
