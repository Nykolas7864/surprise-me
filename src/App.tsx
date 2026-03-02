import { useRef } from 'react';
import { Header } from './components/layout/Header.tsx';
import { Footer } from './components/layout/Footer.tsx';
import { SearchForm } from './components/search/SearchForm.tsx';
import { ResultsSection } from './components/results/ResultsSection.tsx';
import { useRecommendation } from './hooks/useRecommendation.ts';
import { useTheme } from './hooks/useTheme.ts';
import { categories } from './data/categories.ts';
import type { MediaCategory, RecommendRequest } from './types/index.ts';

function App() {
  const {
    recommendations,
    analysisOfTaste,
    connectionThread,
    isLoading,
    error,
    search,
    reroll,
  } = useRecommendation();

  const { applyTheme } = useTheme();
  const lastRequestRef = useRef<RecommendRequest | null>(null);
  const selectedCategoryRef = useRef<MediaCategory | null>(null);

  const handleSearch = (request: RecommendRequest) => {
    lastRequestRef.current = request;
    selectedCategoryRef.current = request.category;
    search(request);
  };

  const handleReroll = () => {
    if (lastRequestRef.current) {
      reroll(lastRequestRef.current);
    }
  };

  const handleCategoryChange = (category: MediaCategory | null) => {
    selectedCategoryRef.current = category;
    applyTheme(category);
  };

  const actionVerb = selectedCategoryRef.current
    ? categories.find((c) => c.id === selectedCategoryRef.current)?.actionVerb || 'Explore'
    : 'Explore';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 space-y-8">
        <SearchForm
          onSearch={handleSearch}
          isLoading={isLoading}
          onCategoryChange={handleCategoryChange}
        />
        <ResultsSection
          recommendations={recommendations}
          analysisOfTaste={analysisOfTaste}
          connectionThread={connectionThread}
          isLoading={isLoading}
          error={error}
          actionVerb={actionVerb}
          onReroll={handleReroll}
        />
      </main>

      <Footer />
    </div>
  );
}

export default App;
