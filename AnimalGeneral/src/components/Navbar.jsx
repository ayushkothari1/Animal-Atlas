function Navbar({ favoriteCount, onExplore, onFavorites, showingFavorites }) {
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <button className="brand" onClick={onExplore}>
          <span className="brand-mark">✦</span>

          <span>
            Animal<span>Atlas</span>
          </span>
        </button>

        <nav className="desktop-nav">
          <button onClick={onExplore}>Explore</button>

          <button onClick={onExplore}>Species</button>

          <button onClick={onExplore}>Discover</button>
        </nav>

        <button
          className={
            showingFavorites ? "favorites-nav active" : "favorites-nav"
          }
          onClick={onFavorites}
        >
          <span>{showingFavorites ? "♥" : "♡"}</span>

          <span>Favorites</span>

          {favoriteCount > 0 && <strong>{favoriteCount}</strong>}
        </button>
      </div>
    </header>
  );
}

export default Navbar;
