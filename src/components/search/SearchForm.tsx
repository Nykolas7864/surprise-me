import { useState } from 'react';
import { CategorySelector } from './CategorySelector.tsx';
import { MediaInput } from './MediaInput.tsx';
import { AdventureSlider } from './AdventureSlider.tsx';
import type { MediaCategory, RecommendRequest } from '../../types/index.ts';

interface SearchFormProps {
  onSearch: (request: RecommendRequest) => void;
  isLoading: boolean;
  onCategoryChange?: (category: MediaCategory | null) => void;
}

export function SearchForm({ onSearch, isLoading, onCategoryChange }: SearchFormProps) {
  const [category, setCategory] = useState<MediaCategory | null>(null);
  const [customCategory, setCustomCategory] = useState('');
  const [examples, setExamples] = useState<string[]>(['']);
  const [adventureLevel, setAdventureLevel] = useState(3);

  const handleCategorySelect = (cat: MediaCategory) => {
    setCategory(cat);
    onCategoryChange?.(cat);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!category) return;

    const filledExamples = examples.filter((ex) => ex.trim().length > 0);
    if (filledExamples.length === 0) return;

    onSearch({
      category,
      examples: filledExamples,
      adventureLevel,
      customCategory: category === 'custom' ? customCategory : undefined,
    });
  };

  const filledExamples = examples.filter((ex) => ex.trim().length > 0);
  const canSubmit = category && filledExamples.length >= 1 && !isLoading
    && (category !== 'custom' || customCategory.trim().length > 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <CategorySelector selected={category} onSelect={handleCategorySelect} />

      {/* Custom category input */}
      {category === 'custom' && (
        <div className="animate-fade-up">
          <label className="block text-sm font-medium text-text-secondary mb-2">
            What type of media?
          </label>
          <input
            type="text"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            placeholder="e.g. Podcasts, Board Games, Video Games..."
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5
                      text-text-primary placeholder:text-text-muted
                      focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30
                      transition-all duration-200"
          />
        </div>
      )}

      {category && (
        <>
          <div className="animate-fade-up delay-100">
            <MediaInput
              examples={examples}
              onChange={setExamples}
              category={category}
            />
          </div>

          <div className="animate-fade-up delay-200">
            <AdventureSlider
              value={adventureLevel}
              onChange={setAdventureLevel}
            />
          </div>

          <div className="animate-fade-up delay-300">
            <button
              type="submit"
              disabled={!canSubmit}
              className={`
                w-full py-3.5 rounded-xl font-bold text-lg cursor-pointer
                transition-all duration-300
                ${canSubmit
                  ? 'bg-gradient-to-r from-[var(--color-gradient-from)] to-[var(--color-gradient-to)] text-white shadow-[0_0_20px_rgba(var(--glass-rgb,139,92,246),0.3)] hover:shadow-[0_0_30px_rgba(var(--glass-rgb,139,92,246),0.5)] hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-surface text-text-muted border border-border cursor-not-allowed'
                }
              `}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-dice-spin inline-block">&#x1F3B2;</span>
                  Finding surprises...
                </span>
              ) : (
                'Surprise Me!'
              )}
            </button>
          </div>
        </>
      )}
    </form>
  );
}
