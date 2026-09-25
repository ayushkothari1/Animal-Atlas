import { useMemo, useState } from "react";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import CategoryFilter from "./components/CategoryFilter";
import AnimalGrid from "./components/AnimalGrid";
import AnimalModal from "./components/AnimalModal";
import Footer from "./components/Footer";

import useAnimals from "./hooks/useAnimals";
import useFavorites from "./hooks/useFavorites";

function App() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [showFavorites, setShowFavorites] = useState(false);

  const { animals, loading } = useAnimals();

  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(animals.map((animal) => animal.category)),
    ];

    return ["All", ...uniqueCategories];
  }, [animals]);

  /*
   * Search is intentionally forgiving.
   *
   * Example:
   * "tiger"       -> Bengal Tiger
   * "bengal"      -> Bengal Tiger
   * "panthera"    -> Bengal Tiger
   * "south asia"  -> Bengal Tiger
   *
   * We normalize the text before comparing it.
   */
  const filteredAnimals = useMemo(() => {
    const query = search.trim().toLowerCase().replace(/\s+/g, " ");

    return animals.filter((animal) => {
      const matchesFavorite = !showFavorites || isFavorite(animal.id);

      const matchesCategory =
        category === "All" || animal.category === category;

      const searchableText = [
        animal.name,
        animal.scientificName,
        animal.category,
        animal.location,
        animal.diet,
        animal.status,
        animal.description,
        ...(animal.aliases || []),
      ]
        .join(" ")
        .toLowerCase();

      const queryWords = query.split(" ").filter(Boolean);

      const matchesSearch =
        queryWords.length === 0 ||
        queryWords.every((word) => searchableText.includes(word));

      return matchesFavorite && matchesCategory && matchesSearch;
    });
  }, [animals, search, category, showFavorites, isFavorite]);

  const handleExplore = () => {
    setShowFavorites(false);

    document.getElementById("explore")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const handleFavorites = () => {
    setShowFavorites(true);
    setCategory("All");
    setSearch("");

    setTimeout(() => {
      document.getElementById("explore")?.scrollIntoView({
        behavior: "smooth",
      });
    }, 0);
  };

  const handleCategoryChange = (newCategory) => {
    setShowFavorites(false);
    setCategory(newCategory);
  };

  return (
    <div className="app">
      <Navbar
        favoriteCount={favorites.length}
        onExplore={handleExplore}
        onFavorites={handleFavorites}
        showingFavorites={showFavorites}
      />

      <main>
        <Hero
          search={search}
          setSearch={(value) => {
            setShowFavorites(false);
            setSearch(value);
          }}
          onExplore={handleExplore}
          animalCount={animals.length}
        />

        <section className="explore-section" id="explore">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="eyebrow">
                  {showFavorites ? "YOUR COLLECTION" : "EXPLORE THE WILD"}
                </span>

                <h2>
                  {showFavorites ? (
                    <>
                      Your <span>favorites</span>
                    </>
                  ) : (
                    <>
                      Meet the <span>animals</span>
                    </>
                  )}
                </h2>

                <p>
                  {showFavorites
                    ? "The species you've saved for later."
                    : "Discover fascinating species from forests, oceans, mountains and skies."}
                </p>
              </div>

              <div className="result-count">
                <strong>{filteredAnimals.length}</strong>

                <span>{showFavorites ? "saved species" : "species found"}</span>
              </div>
            </div>

            {!showFavorites && (
              <CategoryFilter
                categories={categories}
                activeCategory={category}
                onChange={handleCategoryChange}
              />
            )}

            {showFavorites && favorites.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">♡</div>

                <h3>No favorites yet</h3>

                <p>Tap the heart on any animal to save it here.</p>

                <button
                  className="primary-button empty-action"
                  onClick={handleExplore}
                >
                  Explore animals
                  <span>→</span>
                </button>
              </div>
            ) : (
              <AnimalGrid
                animals={filteredAnimals}
                loading={loading}
                favorites={favorites}
                isFavorite={isFavorite}
                onFavorite={toggleFavorite}
                onSelect={setSelectedAnimal}
              />
            )}
          </div>
        </section>

        {!showFavorites && (
          <section className="discover-section">
            <div className="container">
              <div className="discover-card">
                <div className="discover-content">
                  <span className="eyebrow">BUILT FOR CURIOSITY</span>

                  <h2>
                    There is still so much
                    <br />
                    <span>to discover.</span>
                  </h2>

                  <p>
                    Animal Atlas is designed to turn biodiversity data into
                    something beautiful, searchable and easy to explore.
                  </p>

                  <button className="primary-button" onClick={handleExplore}>
                    Explore species
                    <span>→</span>
                  </button>
                </div>

                <div className="discover-orbit">
                  <div className="orbit orbit-one" />
                  <div className="orbit orbit-two" />
                  <div className="orbit orbit-three" />

                  <div className="discover-animal">🦁</div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />

      {selectedAnimal && (
        <AnimalModal
          animal={selectedAnimal}
          favorite={isFavorite(selectedAnimal.id)}
          onFavorite={() => toggleFavorite(selectedAnimal)}
          onClose={() => setSelectedAnimal(null)}
        />
      )}
    </div>
  );
}

export default App;
