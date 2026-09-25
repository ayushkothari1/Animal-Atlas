import AnimalCard from "./AnimalCard";
import LoadingSkeleton from "./LoadingSkeleton";

function AnimalGrid({ animals, loading, isFavorite, onFavorite, onSelect }) {
  if (loading) {
    return (
      <div className="animal-grid">
        {Array.from({ length: 8 }).map((_, index) => (
          <LoadingSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (animals.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔎</div>

        <h3>No animals found</h3>

        <p>Try another search term or select a different category.</p>
      </div>
    );
  }

  return (
    <div className="animal-grid">
      {animals.map((animal, index) => (
        <AnimalCard
          key={animal.id}
          animal={animal}
          index={index}
          favorite={isFavorite(animal.id)}
          onFavorite={() => onFavorite(animal)}
          onSelect={() => onSelect(animal)}
        />
      ))}
    </div>
  );
}

export default AnimalGrid;
