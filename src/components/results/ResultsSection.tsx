import type { DisplayRecommendation } from '../../types/index.ts';
import { RecommendationCard } from './RecommendationCard.tsx';
import { LoadingSkeleton } from './LoadingSkeleton.tsx';
import { EmptyState } from './EmptyState.tsx';

interface ResultsSectionProps {
  recommendations: DisplayRecommendation[] | null;
  analysisOfTaste: string | null;
  connectionThread: string | null;
  isLoading: boolean;
  error: string | null;
  actionVerb: string;
  onReroll: () => void;
  isRerolling?: boolean;
}

export function ResultsSection({
  recommendations,
  analysisOfTaste,
  connectionThread,
  isLoading,
  error,
  actionVerb,
  onReroll,
}: ResultsSectionProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="glass rounded-2xl p-6 text-center animate-fade-up">
        <div className="text-4xl mb-3">&#x1F615;</div>
        <h3 className="text-lg font-bold text-text-primary mb-2">Something went wrong</h3>
        <p className="text-sm text-text-secondary">{error}</p>
      </div>
    );
  }

  if (!recommendations) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-5">
      {/* Taste Analysis */}
      {analysisOfTaste && (
        <div className="glass rounded-xl p-4 animate-fade-up">
          <p className="text-xs font-semibold text-primary-muted mb-1 uppercase tracking-wider">
            &#x1F9E0; Your Taste Profile
          </p>
          <p className="text-sm text-text-secondary leading-relaxed">
            {analysisOfTaste}
          </p>
        </div>
      )}

      {/* Recommendation Cards */}
      {recommendations.map((rec, i) => (
        <RecommendationCard
          key={`${rec.title}-${i}`}
          rec={rec}
          index={i}
          actionVerb={actionVerb}
        />
      ))}

      {/* Connection Thread */}
      {connectionThread && (
        <div className="glass rounded-xl p-4 animate-fade-up delay-600">
          <p className="text-xs font-semibold text-primary-muted mb-1 uppercase tracking-wider">
            &#x1F517; The Thread
          </p>
          <p className="text-sm text-text-secondary leading-relaxed italic">
            {connectionThread}
          </p>
        </div>
      )}

      {/* Surprise Me Again Button */}
      <div className="text-center pt-2 animate-fade-up delay-600">
        <button
          onClick={onReroll}
          className="inline-flex items-center gap-2 rounded-xl
                    border border-primary/30 bg-primary/10
                    px-6 py-3 text-sm font-bold text-primary-muted
                    hover:bg-primary/20 hover:shadow-[0_0_20px_rgba(var(--glass-rgb,139,92,246),0.2)]
                    transition-all duration-300 cursor-pointer
                    active:scale-95"
        >
          <span className="text-lg">&#x1F3B2;</span>
          Surprise Me Again!
        </button>
      </div>
    </div>
  );
}
