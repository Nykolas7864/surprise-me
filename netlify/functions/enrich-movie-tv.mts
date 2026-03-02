import type { Context } from '@netlify/functions';

// ============================================================
// TYPES
// ============================================================

interface EnrichTitle {
  title: string;
  creator: string;
  year: number;
}

interface EnrichRequest {
  titles: EnrichTitle[];
  mediaType?: 'movie' | 'tv';
}

interface EnrichedMetadata {
  title: string;
  imageUrl?: string;
  externalRating?: number;
  externalRatingSource?: string;
  extraInfo: Record<string, string>;
  actionUrl?: string;
  actionLabel?: string;
}

// ============================================================
// TMDB API
// ============================================================

async function searchTMDBMovie(title: string, year: number, apiKey: string): Promise<EnrichedMetadata | null> {
  const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}&year=${year}&page=1`;

  const searchRes = await fetch(searchUrl);
  if (!searchRes.ok) return null;

  const searchData = await searchRes.json();
  const movie = searchData.results?.[0];
  if (!movie) return null;

  const detailUrl = `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}`;
  const detailRes = await fetch(detailUrl);
  const detail = detailRes.ok ? await detailRes.json() : null;

  const genres = detail?.genres?.map((g: { name: string }) => g.name).join(', ') || '';
  const runtime = detail?.runtime ? `${detail.runtime} min` : '';

  return {
    title,
    imageUrl: movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : undefined,
    externalRating: movie.vote_average ? Math.round(movie.vote_average * 10) / 10 : undefined,
    externalRatingSource: 'TMDB',
    extraInfo: {
      ...(genres && { genres }),
      ...(runtime && { runtime }),
      ...(movie.release_date && { released: movie.release_date.slice(0, 4) }),
      ...(detail?.tagline && { tagline: detail.tagline }),
    },
    actionUrl: `https://www.themoviedb.org/movie/${movie.id}`,
    actionLabel: 'View on TMDB',
  };
}

async function searchTMDBTV(title: string, year: number, apiKey: string): Promise<EnrichedMetadata | null> {
  const searchUrl = `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${encodeURIComponent(title)}&first_air_date_year=${year}&page=1`;

  const searchRes = await fetch(searchUrl);
  if (!searchRes.ok) return null;

  const searchData = await searchRes.json();
  const show = searchData.results?.[0];
  if (!show) return null;

  const detailUrl = `https://api.themoviedb.org/3/tv/${show.id}?api_key=${apiKey}`;
  const detailRes = await fetch(detailUrl);
  const detail = detailRes.ok ? await detailRes.json() : null;

  const genres = detail?.genres?.map((g: { name: string }) => g.name).join(', ') || '';
  const seasons = detail?.number_of_seasons ? `${detail.number_of_seasons} season${detail.number_of_seasons > 1 ? 's' : ''}` : '';
  const status = detail?.status || '';
  const avgRuntime = detail?.episode_run_time?.[0] ? `~${detail.episode_run_time[0]} min/ep` : '';

  return {
    title,
    imageUrl: show.poster_path
      ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
      : undefined,
    externalRating: show.vote_average ? Math.round(show.vote_average * 10) / 10 : undefined,
    externalRatingSource: 'TMDB',
    extraInfo: {
      ...(genres && { genres }),
      ...(seasons && { seasons }),
      ...(avgRuntime && { runtime: avgRuntime }),
      ...(status && { status }),
      ...(show.first_air_date && { aired: show.first_air_date.slice(0, 4) }),
    },
    actionUrl: `https://www.themoviedb.org/tv/${show.id}`,
    actionLabel: 'View on TMDB',
  };
}

// ============================================================
// HANDLER
// ============================================================

export default async (req: Request, _context: Context) => {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body: EnrichRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!body.titles?.length) {
    return new Response(
      JSON.stringify({ error: 'Missing titles array' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const tmdbApiKey = process.env.TMDB_API_KEY;
  if (!tmdbApiKey) {
    return new Response(
      JSON.stringify({ error: 'TMDB API key not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const isTV = body.mediaType === 'tv';

  const enriched = await Promise.all(
    body.titles.map(async (t) => {
      try {
        const result = isTV
          ? await searchTMDBTV(t.title, t.year, tmdbApiKey)
          : await searchTMDBMovie(t.title, t.year, tmdbApiKey);
        return result || { title: t.title, extraInfo: {} };
      } catch (err) {
        console.error(`Failed to enrich "${t.title}":`, err);
        return { title: t.title, extraInfo: {} };
      }
    })
  );

  return new Response(
    JSON.stringify({ enriched }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
