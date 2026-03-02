import type { RecommendRequest, RecommendResponse, EnrichTitle, EnrichedMetadata } from '../types/index.ts';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function post<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `API error (${response.status})`);
  }

  return response.json();
}

export async function getRecommendations(request: RecommendRequest): Promise<RecommendResponse> {
  return post<RecommendResponse>('recommend', request);
}

export async function enrichMovieTV(titles: EnrichTitle[], mediaType: 'movie' | 'tv' = 'movie'): Promise<EnrichedMetadata[]> {
  const result = await post<{ enriched: EnrichedMetadata[] }>('enrich-movie-tv', { titles, mediaType });
  return result.enriched;
}

export async function enrichAnime(titles: EnrichTitle[]): Promise<EnrichedMetadata[]> {
  const result = await post<{ enriched: EnrichedMetadata[] }>('enrich-anime', { titles });
  return result.enriched;
}
