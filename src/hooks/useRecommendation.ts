import { useState, useCallback } from 'react';
import type {
  RecommendRequest,
  DisplayRecommendation,
  EnrichTitle,
} from '../types/index.ts';
import { getRecommendations, enrichMovieTV, enrichAnime } from '../services/api.ts';

interface RecommendationState {
  recommendations: DisplayRecommendation[] | null;
  analysisOfTaste: string | null;
  connectionThread: string | null;
  isLoading: boolean;
  isEnriching: boolean;
  error: string | null;
}

const ENRICHABLE_CATEGORIES = ['movies', 'tv', 'anime'] as const;

export function useRecommendation() {
  const [state, setState] = useState<RecommendationState>({
    recommendations: null,
    analysisOfTaste: null,
    connectionThread: null,
    isLoading: false,
    isEnriching: false,
    error: null,
  });
  const [rollCount, setRollCount] = useState(0);

  const enrichResults = useCallback(async (
    recs: DisplayRecommendation[],
    category: string,
  ) => {
    if (!ENRICHABLE_CATEGORIES.includes(category as typeof ENRICHABLE_CATEGORIES[number])) {
      return;
    }

    setState((prev) => ({ ...prev, isEnriching: true }));

    const titles: EnrichTitle[] = recs.map((r) => ({
      title: r.title,
      creator: r.creator,
      year: r.year,
    }));

    try {
      let enriched;
      if (category === 'movies' || category === 'tv') {
        enriched = await enrichMovieTV(titles, category === 'tv' ? 'tv' : 'movie');
      } else if (category === 'anime') {
        enriched = await enrichAnime(titles);
      } else {
        return;
      }

      setState((prev) => {
        if (!prev.recommendations) return prev;

        const updated = prev.recommendations.map((rec) => {
          const match = enriched?.find(
            (e) => e.title.toLowerCase() === rec.title.toLowerCase()
          );
          return {
            ...rec,
            enrichment: match || rec.enrichment,
            isEnriching: false,
          };
        });

        return { ...prev, recommendations: updated, isEnriching: false };
      });
    } catch (err) {
      console.error('Enrichment failed:', err);
      // Graceful degradation: just stop enriching, keep AI results
      setState((prev) => {
        if (!prev.recommendations) return { ...prev, isEnriching: false };
        const updated = prev.recommendations.map((r) => ({ ...r, isEnriching: false }));
        return { ...prev, recommendations: updated, isEnriching: false };
      });
    }
  }, []);

  const search = useCallback(async (request: RecommendRequest) => {
    setState({
      recommendations: null,
      analysisOfTaste: null,
      connectionThread: null,
      isLoading: true,
      isEnriching: false,
      error: null,
    });

    try {
      const response = await getRecommendations(request);

      const displayRecs: DisplayRecommendation[] = response.recommendations.map((rec) => ({
        ...rec,
        isEnriching: ENRICHABLE_CATEGORIES.includes(
          request.category as typeof ENRICHABLE_CATEGORIES[number]
        ),
      }));

      setState({
        recommendations: displayRecs,
        analysisOfTaste: response.analysisOfTaste,
        connectionThread: response.connectionThread,
        isLoading: false,
        isEnriching: true,
        error: null,
      });

      // Fire enrichment in background
      enrichResults(displayRecs, request.category);
    } catch (err) {
      setState({
        recommendations: null,
        analysisOfTaste: null,
        connectionThread: null,
        isLoading: false,
        isEnriching: false,
        error: err instanceof Error ? err.message : 'Something went wrong',
      });
    }
  }, [enrichResults]);

  const reroll = useCallback(async (request: RecommendRequest) => {
    const newRoll = rollCount + 1;
    setRollCount(newRoll);
    await search({ ...request, rollSeed: newRoll + Date.now() });
  }, [rollCount, search]);

  return {
    ...state,
    search,
    reroll,
    rollCount,
  };
}
