function CategoryFilter({ categories, activeCategory, onChange }) {
  return (
    <div className="category-filter">
      {categories.map((category) => (
        <button
          key={category}
          className={
            activeCategory === category
              ? "category-button active"
              : "category-button"
          }
          onClick={() => onChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter;
