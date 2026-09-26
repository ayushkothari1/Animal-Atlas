import { useEffect, useState } from "react";
function AnimalModal({ animal, favorite, onFavorite, onClose }) {
  const [details, setDetails] = useState(animal);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [showImage, setShowImage] = useState(false);
  useEffect(() => {
    setDetails(animal);
    setLoadingDetails(true);
    setShowImage(false);
    let cancelled = false;
    async function loadDetails() {
      try {
        const response = await fetch(`/api/animals/${animal.id}`);
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        const result = await response.json();
        if (!cancelled && result.success && result.animal) {
          setDetails(result.animal);
        }
      } catch (error) {
        console.error("Failed to load animal details:", error);
      } finally {
        if (!cancelled) {
          setLoadingDetails(false);
        }
      }
    }
    loadDetails();
    return () => {
      cancelled = true;
    };
  }, [animal]);
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (showImage) {
          setShowImage(false);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, showImage]);
  const getValue = (value, fallback = "Information unavailable") => {
    if (value === null || value === undefined || value === "") {
      return fallback;
    }
    return value;
  };
  return (
    <>
      {" "}
      <div
        className="modal-backdrop"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            onClose();
          }
        }}
      >
        {" "}
        <div className="animal-modal">
          {" "}
          <button className="modal-close" onClick={onClose} aria-label="Close">
            {" "}
            ×{" "}
          </button>{" "}
          {/* IMAGE */}{" "}
          <button
            type="button"
            className="modal-image"
            onClick={() => {
              if (details.image) {
                setShowImage(true);
              }
            }}
            aria-label={`View ${details.name} image`}
          >
            {" "}
            {details.image ? (
              <img src={details.image} alt={details.name} />
            ) : (
              <div className="modal-image-placeholder"> 🐾 </div>
            )}{" "}
            <div className="modal-image-gradient" />{" "}
            <span className="modal-category"> {details.category} </span>{" "}
            {details.image && (
              <span className="image-expand-hint"> ⛶ View full image </span>
            )}{" "}
          </button>{" "}
          {/* CONTENT */}{" "}
          <div className="modal-content">
            {" "}
            <div className="modal-heading">
              {" "}
              <div>
                {" "}
                <span className="eyebrow"> SPECIES PROFILE </span>{" "}
                <h2>{details.name}</h2>{" "}
                <p className="scientific-name">
                  {" "}
                  {details.scientificName}{" "}
                </p>{" "}
              </div>{" "}
              <button
                className={
                  favorite ? "modal-favorite active" : "modal-favorite"
                }
                onClick={onFavorite}
                aria-label={
                  favorite ? "Remove from favorites" : "Add to favorites"
                }
              >
                {" "}
                {favorite ? "♥" : "♡"}{" "}
              </button>{" "}
            </div>{" "}
            {/* DESCRIPTION */}{" "}
            <div className="description-section">
              {" "}
              <p className="modal-description">
                {" "}
                {getValue(
                  details.description,
                  "No description is available for this species yet.",
                )}{" "}
              </p>{" "}
              {loadingDetails && (
                <span className="background-loading">
                  {" "}
                  Updating species information...{" "}
                </span>
              )}{" "}
            </div>{" "}
            {/* DETAILS */}{" "}
            <div className="detail-grid">
              {" "}
              <div>
                {" "}
                <span>Classification</span>{" "}
                <strong> {getValue(details.category)} </strong>{" "}
              </div>{" "}
              <div>
                {" "}
                <span>Conservation</span>{" "}
                <strong> {getValue(details.conservation)} </strong>{" "}
              </div>{" "}
              <div>
                {" "}
                <span>Habitat</span>{" "}
                <strong> {getValue(details.habitat)} </strong>{" "}
              </div>{" "}
              <div>
                {" "}
                <span>Diet</span>{" "}
                <strong> {getValue(details.diet)} </strong>{" "}
              </div>{" "}
            </div>{" "}
            {/* ACTIONS */}{" "}
            <div className="modal-actions">
              {" "}
              <button className="primary-button" onClick={onFavorite}>
                {" "}
                {favorite ? "Remove from favorites" : "Add to favorites"}{" "}
              </button>{" "}
              <button className="secondary-button" onClick={onClose}>
                {" "}
                Close{" "}
              </button>{" "}
            </div>{" "}
            {details.wikipediaUrl && (
              <a
                className="data-source-link"
                href={details.wikipediaUrl}
                target="_blank"
                rel="noreferrer"
              >
                {" "}
                Read more about this species →{" "}
              </a>
            )}{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* FULL SCREEN IMAGE VIEWER */}{" "}
      {showImage && details.image && (
        <div
          className="image-viewer"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowImage(false);
            }
          }}
        >
          {" "}
          <button
            type="button"
            className="image-viewer-close"
            onClick={() => setShowImage(false)}
            aria-label="Close image viewer"
          >
            {" "}
            ×{" "}
          </button>{" "}
          <div className="image-viewer-content">
            {" "}
            <img src={details.image} alt={details.name} />{" "}
            <div className="image-viewer-caption">
              {" "}
              <strong>{details.name}</strong>{" "}
              <span> {details.scientificName} </span>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </>
  );
}
export default AnimalModal;
