function AnimalCard({ animal, favorite, onFavorite, onSelect, index }) {
  return (
    <article
      className="animal-card"
      style={{
        "--card-delay": `${Math.min(index * 70, 500)}ms`,
      }}
    >
      <button
        className="animal-image-button"
        onClick={onSelect}
        aria-label={`View ${animal.name}`}
      >
        <div className="animal-image-wrapper">
          <img src={animal.image} alt={animal.name} loading="lazy" />

          <div className="image-overlay" />

          <span className="animal-category">{animal.category}</span>

          <span className="view-label">View →</span>
        </div>
      </button>

      <div className="animal-card-content">
        <div className="animal-card-top">
          <div>
            <h3>{animal.name}</h3>

            <p>{animal.scientificName}</p>
          </div>

          <button
            className={favorite ? "favorite-button active" : "favorite-button"}
            onClick={onFavorite}
            aria-label={
              favorite
                ? `Remove ${animal.name} from favorites`
                : `Add ${animal.name} to favorites`
            }
          >
            {favorite ? "♥" : "♡"}
          </button>
        </div>

        <div className="animal-meta">
          <span>
            <i />
            {animal.status}
          </span>

          <span>{animal.location}</span>
        </div>
      </div>
    </article>
  );
}

export default AnimalCard;
