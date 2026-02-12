/* eslint-disable react/prop-types */
const CategoryFilter = ({ categories, activeCategory, onCategoryChange }) => {
  if (!categories || categories.length === 0) return null;

  return (
    <div aria-label="Filtrar por categoria" className="flex gap-2 flex-wrap">
      <button
        aria-pressed={!activeCategory}
        onClick={() => onCategoryChange(null)}
        className={`px-4 py-1.5 text-sm font-medium rounded-full border-2 transition-all duration-200 ${
          !activeCategory
            ? 'bg-accent text-white border-accent'
            : 'border-light-border-primary dark:border-dark-border-primary text-light-text-secondary dark:text-dark-text-secondary hover:border-accent hover:text-accent'
        }`}
      >
        Todas
      </button>
      {categories.map((cat) => {
        const isActive = activeCategory === cat.slug;
        return (
          <button
            key={cat.id}
            aria-pressed={isActive}
            onClick={() => onCategoryChange(isActive ? null : cat.slug)}
            className={`px-4 py-1.5 text-sm font-medium rounded-full border-2 transition-all duration-200 ${
              isActive
                ? 'bg-accent text-white border-accent'
                : 'border-light-border-primary dark:border-dark-border-primary text-light-text-secondary dark:text-dark-text-secondary hover:border-accent hover:text-accent'
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
