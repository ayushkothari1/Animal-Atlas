function LoadingSkeleton() {
  return (
    <article className="animal-card skeleton-card">
      <div className="skeleton-image" />

      <div className="skeleton-content">
        <div className="skeleton-line large" />
        <div className="skeleton-line medium" />
        <div className="skeleton-line small" />
      </div>
    </article>
  );
}

export default LoadingSkeleton;
