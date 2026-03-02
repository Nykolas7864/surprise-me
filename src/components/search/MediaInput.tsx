import type { MediaCategory } from '../../types/index.ts';
import { categories } from '../../data/categories.ts';

interface MediaInputProps {
  examples: string[];
  onChange: (examples: string[]) => void;
  category: MediaCategory | null;
}

const PLACEHOLDERS: Record<MediaCategory, string[]> = {
  movies: ['e.g. Inception', 'e.g. The Matrix', 'e.g. Interstellar'],
  tv: ['e.g. Breaking Bad', 'e.g. The Wire', 'e.g. Dark'],
  anime: ['e.g. Attack on Titan', 'e.g. Steins;Gate', 'e.g. Cowboy Bebop'],
  books: ['e.g. Dune', 'e.g. 1984', 'e.g. Neuromancer'],
  manga: ['e.g. Berserk', 'e.g. Vagabond', 'e.g. Monster'],
  music: ['e.g. OK Computer', 'e.g. To Pimp a Butterfly', 'e.g. Kid A'],
  custom: ['e.g. Title 1', 'e.g. Title 2', 'e.g. Title 3'],
};

export function MediaInput({ examples, onChange, category }: MediaInputProps) {
  const placeholders = category ? PLACEHOLDERS[category] : PLACEHOLDERS.custom;
  const categoryLabel = category
    ? categories.find((c) => c.id === category)?.label?.toLowerCase() || 'titles'
    : 'titles';

  const updateExample = (index: number, value: string) => {
    const updated = [...examples];
    updated[index] = value;
    onChange(updated);
  };

  const addExample = () => {
    if (examples.length < 3) {
      onChange([...examples, '']);
    }
  };

  const removeExample = (index: number) => {
    if (examples.length > 1) {
      onChange(examples.filter((_, i) => i !== index));
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-3">
        Name some {categoryLabel} you already love
        <span className="text-text-muted ml-1">({examples.length}/3)</span>
      </label>

      <div className="space-y-2">
        {examples.map((example, i) => (
          <div key={i} className="flex items-center gap-2 animate-fade-in">
            <div className="flex items-center justify-center w-6 h-6 rounded-full
                           bg-primary/20 text-primary text-xs font-bold shrink-0">
              {i + 1}
            </div>
            <input
              type="text"
              value={example}
              onChange={(e) => updateExample(i, e.target.value)}
              placeholder={placeholders[i] || 'Add another...'}
              className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5
                        text-text-primary placeholder:text-text-muted
                        focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30
                        transition-all duration-200"
            />
            {examples.length > 1 && (
              <button
                onClick={() => removeExample(i)}
                className="w-8 h-8 flex items-center justify-center rounded-lg
                          text-text-muted hover:text-red-400 hover:bg-red-500/10
                          transition-colors duration-200 cursor-pointer"
                aria-label="Remove example"
              >
                &times;
              </button>
            )}
          </div>
        ))}
      </div>

      {examples.length < 3 && (
        <button
          onClick={addExample}
          className="mt-2 text-sm text-primary hover:text-primary-hover
                    transition-colors duration-200 cursor-pointer"
        >
          + Add another example
        </button>
      )}
    </div>
  );
}
