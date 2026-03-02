import { categories } from '../../data/categories.ts';
import type { MediaCategory } from '../../types/index.ts';

interface CategorySelectorProps {
  selected: MediaCategory | null;
  onSelect: (category: MediaCategory) => void;
}

export function CategorySelector({ selected, onSelect }: CategorySelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-3">
        What are you looking for?
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {categories.map((cat) => {
          const isSelected = selected === cat.id;
          const isDisabled = !cat.enabled;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => !isDisabled && onSelect(cat.id)}
              disabled={isDisabled}
              className={`
                relative flex flex-col items-center gap-1 rounded-xl px-3 py-3
                border transition-all duration-300 cursor-pointer
                ${isSelected
                  ? 'border-primary bg-primary/15 shadow-[0_0_16px_rgba(var(--glass-rgb,139,92,246),0.2)]'
                  : 'border-border bg-surface hover:bg-surface-hover hover:border-primary/40'
                }
                ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}
              `}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-text-primary'}`}>
                {cat.label}
              </span>
              {isDisabled && (
                <span className="text-[10px] text-text-muted">Coming Soon</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
