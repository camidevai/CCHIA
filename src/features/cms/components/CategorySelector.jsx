/* eslint-disable react/prop-types */
import { useCategories } from '../../blog/hooks/useCategories';

const CategorySelector = ({ selectedIds, onChange }) => {
  const { categories, isLoading } = useCategories();

  const toggleCategory = (id) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((cid) => cid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 w-20 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-full animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
        Categorias
      </label>
      <div className="flex gap-2 flex-wrap" role="group" aria-label="Seleccionar categorias">
        {categories.map((cat) => {
          const isSelected = selectedIds.includes(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleCategory(cat.id)}
              aria-pressed={isSelected}
              className={`px-4 py-1.5 text-sm rounded-full border transition-all duration-200 ${
                isSelected
                  ? 'bg-accent text-white border-accent'
                  : 'bg-light-bg-secondary dark:bg-dark-bg-secondary border-light-border-primary dark:border-dark-border-primary text-light-text-secondary dark:text-dark-text-secondary hover:border-accent'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
        {categories.length === 0 && (
          <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
            No hay categorias disponibles
          </p>
        )}
      </div>
    </div>
  );
};

export default CategorySelector;
