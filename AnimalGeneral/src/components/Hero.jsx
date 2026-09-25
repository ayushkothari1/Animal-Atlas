function Hero({ search, setSearch, onExplore, animalCount }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onExplore();
  };

  return (
    <section className="hero">
      <div className="hero-glow hero-glow-one" />
      <div className="hero-glow hero-glow-two" />

      <div className="hero-grid" />

      <div className="container hero-container">
        <div className="hero-copy">
          <div className="live-badge">
            <span className="live-dot" />
            <span>LIVE BIODIVERSITY EXPLORER</span>
          </div>

          <h1>
            Discover the
            <br />
            <span>wild side</span>
            <br />
            of our planet.
          </h1>

          <p>
            Explore remarkable animals, learn about their world and discover
            species you never knew existed.
          </p>

          <form className="hero-search" onSubmit={handleSubmit}>
            <span className="search-icon">⌕</span>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search animals, species..."
              aria-label="Search animals"
            />

            <button type="submit">
              Explore
              <span>→</span>
            </button>
          </form>

          <div className="hero-stats">
            <div>
              <strong>{animalCount}+</strong>
              <span>species</span>
            </div>

            <div className="stat-divider" />

            <div>
              <strong>7</strong>
              <span>continents</span>
            </div>

            <div className="stat-divider" />

            <div>
              <strong>∞</strong>
              <span>stories</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-circle hero-circle-back" />
          <div className="hero-circle hero-circle-front" />

          <div className="hero-ring ring-one" />
          <div className="hero-ring ring-two" />

          <div className="floating-card floating-card-top">
            <span>01</span>
            <div>
              <strong>Explore</strong>
              <small>Thousands of species</small>
            </div>
          </div>

          <div className="hero-animal">
            <span className="animal-shadow" />
            <div className="animal-emoji">🦁</div>
          </div>

          <div className="floating-card floating-card-bottom">
            <span className="pulse-icon">●</span>
            <div>
              <strong>Living planet</strong>
              <small>Always worth discovering</small>
            </div>
          </div>
        </div>
      </div>

      <button
        className="scroll-indicator"
        onClick={onExplore}
        aria-label="Scroll to animals"
      >
        <span>SCROLL TO EXPLORE</span>
        <span className="scroll-line" />
      </button>
    </section>
  );
}

export default Hero;
