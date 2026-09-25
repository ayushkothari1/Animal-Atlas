import { useEffect } from "react";

function AnimalModal({ animal, favorite, onFavorite, onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      document.body.style.overflow = "";
    };
  }, [onClose]);

  const getValue = (value, fallback = "Not available") => {
    if (value === null || value === undefined || value === "") {
      return fallback;
    }

    return value;
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="animal-modal">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="modal-image">
          {animal.image ? (
            <img src={animal.image} alt={animal.name} />
          ) : (
            <div className="modal-image-placeholder">🐾</div>
          )}

          <div className="modal-image-gradient" />

          <span className="modal-category">{animal.category}</span>
        </div>

        <div className="modal-content">
          <div className="modal-heading">
            <div>
              <span className="eyebrow">SPECIES PROFILE</span>

              <h2>{animal.name}</h2>

              <p className="scientific-name">{animal.scientificName}</p>
            </div>

            <button
              className={favorite ? "modal-favorite active" : "modal-favorite"}
              onClick={onFavorite}
              aria-label={
                favorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              {favorite ? "♥" : "♡"}
            </button>
          </div>

          <p className="modal-description">
            {getValue(
              animal.description,
              "No description is available for this species yet.",
            )}
          </p>

          <div className="detail-grid">
            <div>
              <span>Classification</span>

              <strong>{getValue(animal.category)}</strong>
            </div>

            <div>
              <span>Conservation</span>

              <strong>{getValue(animal.status)}</strong>
            </div>

            <div>
              <span>Habitat</span>

              <strong>{getValue(animal.location)}</strong>
            </div>

            <div>
              <span>Diet</span>

              <strong>{getValue(animal.diet)}</strong>
            </div>
          </div>

          <div className="modal-actions">
            <button className="primary-button" onClick={onFavorite}>
              {favorite ? "Remove from favorites" : "Add to favorites"}
            </button>

            <button className="secondary-button" onClick={onClose}>
              Close
            </button>
          </div>

          {animal.wikipediaUrl && (
            <a
              className="data-source-link"
              href={animal.wikipediaUrl}
              target="_blank"
              rel="noreferrer"
            >
              Read more about this species →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default AnimalModal;
