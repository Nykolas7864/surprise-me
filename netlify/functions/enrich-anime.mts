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
// JIKAN API (MyAnimeList)
// ============================================================

// Jikan rate limit: 3 requests/second, 60/minute
// Add a small delay between requests to be safe
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function searchJikan(title: string): Promise<EnrichedMetadata | null> {
  const searchUrl = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=1&sfw=true`;

  const res = await fetch(searchUrl);
  if (!res.ok) return null;

  const data = await res.json();
  const anime = data.data?.[0];
  if (!anime) return null;

  const genres = anime.genres?.map((g: { name: string }) => g.name).join(', ') || '';
  const studios = anime.studios?.map((s: { name: string }) => s.name).join(', ') || '';
  const episodes = anime.episodes ? `${anime.episodes} episodes` : '';
  const status = anime.status || '';

  return {
    title,
    imageUrl: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || undefined,
    externalRating: anime.score || undefined,
    externalRatingSource: 'MAL',
    extraInfo: {
      ...(genres && { genres }),
      ...(studios && { studios }),
      ...(episodes && { episodes }),
      ...(status && { status }),
      ...(anime.type && { type: anime.type }),
      ...(anime.season && anime.year && { aired: `${anime.season} ${anime.year}` }),
    },
    actionUrl: anime.url || undefined,
    actionLabel: 'View on MyAnimeList',
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

  const enriched: EnrichedMetadata[] = [];

  for (let i = 0; i < body.titles.length; i++) {
    const t = body.titles[i];
    try {
      const result = await searchJikan(t.title);
      enriched.push(result || { title: t.title, extraInfo: {} });
    } catch (err) {
      console.error(`Failed to enrich "${t.title}":`, err);
      enriched.push({ title: t.title, extraInfo: {} });
    }

    // Respect Jikan rate limits: wait 400ms between requests
    if (i < body.titles.length - 1) {
      await delay(400);
    }
  }

  return new Response(
    JSON.stringify({ enriched }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
