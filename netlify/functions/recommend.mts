import type { Context } from '@netlify/functions';
import Anthropic from '@anthropic-ai/sdk';

// ============================================================
// TYPES (duplicated from src/types to avoid import issues in serverless)
// ============================================================

type MediaCategory = 'movies' | 'tv' | 'anime' | 'books' | 'manga' | 'music' | 'custom';

interface RecommendRequest {
  category: MediaCategory;
  examples: string[];
  adventureLevel: number;
  customCategory?: string;
  rollSeed?: number;
}

// ============================================================
// PROMPT BUILDING
// ============================================================

const CATEGORY_LABELS: Record<MediaCategory, string> = {
  movies: 'movies',
  tv: 'TV shows',
  anime: 'anime series',
  books: 'books',
  manga: 'manga series',
  music: 'music albums',
  custom: 'media',
};

const ADVENTURE_INSTRUCTIONS: Record<number, string> = {
  1: `Recommend popular, well-reviewed titles in the SAME genre. These should be mainstream picks that fans of the examples would naturally gravitate toward. Think "if you liked X, you'll love Y" — satisfying, crowd-pleasing recommendations.`,

  2: `Recommend well-known titles that share thematic DNA but may be in adjacent genres or styles. The user should recognize at least 1-2 of the titles. Include one pick that's slightly outside their comfort zone but still approachable.`,

  3: `Mix it up. One recommendation should be a crowd-pleaser, one should be a respected but less mainstream pick, and one should be genuinely unexpected. Look for shared themes, tonal similarities, or creative lineage rather than just genre matching.`,

  4: `Focus on hidden gems and cult favorites. Look for titles from different decades, different countries or cultures, or adjacent genres that share a deep thematic or stylistic connection with the examples. Avoid anything in current top-100 popularity lists. Prioritize quality over obscurity — these should be genuinely great, just lesser-known.`,

  5: `Go wild. Find the most unexpected, delightful connections possible. Cross genres freely. Recommend titles from obscure corners that share a surprising thematic thread with what the user loves. The "surprise connection" is the star here — make it feel like a revelation.`,
};

const RANDOM_SEEDS = [
  'Focus on works from the 1970s-1990s era.',
  'Prioritize works from non-English-speaking creators or international origins.',
  'Look for works with unreliable narrators, twist endings, or subverted expectations.',
  'Focus on debut works by creators who later became famous for something else.',
  'Prioritize works that were initially overlooked but gained cult followings.',
  'Look for works that heavily influenced a completely different genre or medium.',
  'Focus on works created during a major cultural shift in their country of origin.',
  'Prioritize works with unconventional narrative structures or experimental storytelling.',
  'Look for works where the soundtrack or audio design is a defining feature.',
  'Focus on works that blend two or more genres in an unexpected way.',
  'Prioritize works with morally ambiguous protagonists or complex antiheroes.',
  'Look for works that explore philosophical or existential themes through genre fiction.',
];

function getRandomSeed(rollSeed?: number): string {
  const index = rollSeed !== undefined
    ? Math.abs(rollSeed) % RANDOM_SEEDS.length
    : Math.floor(Math.random() * RANDOM_SEEDS.length);
  return RANDOM_SEEDS[index];
}

function buildSystemPrompt(category: MediaCategory, adventureLevel: number, customCategory?: string, rollSeed?: number): string {
  const categoryLabel = category === 'custom' && customCategory
    ? customCategory
    : CATEGORY_LABELS[category];

  const adventureInstruction = ADVENTURE_INSTRUCTIONS[adventureLevel] || ADVENTURE_INSTRUCTIONS[3];

  let randomSeedLine = '';
  if (adventureLevel >= 4 || rollSeed !== undefined) {
    randomSeedLine = `\n\nADDITIONAL CREATIVE DIRECTION: ${getRandomSeed(rollSeed)}`;
  }

  return `You are Surprise Me!, an expert media recommendation engine with encyclopedic knowledge. You analyze what someone loves about their favorite ${categoryLabel} and find recommendations they would NOT have discovered on their own, but will love once they try.

ADVENTURE LEVEL: ${adventureLevel}/5

${adventureInstruction}${randomSeedLine}

RULES:
- NEVER recommend something the user already listed as an example.
- Each recommendation MUST include a "surprise connection" — the non-obvious reason it relates to what they love (thematic parallel, same creator influence, shared narrative DNA, etc.). This is the most important part.
- Recommendations should be REAL, verifiable titles. Do not hallucinate or invent media that doesn't exist.
- Vary your picks: don't recommend multiple items from the same creator, franchise, or studio.
- Provide exactly 3 recommendations.
- For the "year" field, use the original release year.
- For "moodTags", provide 2-4 short descriptive tags (e.g., "mind-bending", "emotional", "slow-burn", "action-packed").
- For "surpriseRating", rate 1-5 how unexpected this pick is relative to the user's examples (1 = obvious match, 5 = wildcard connection).
- For "creator", use the most recognizable credit (director for movies, studio for anime, author for books, artist for music).`;
}

function buildUserPrompt(request: RecommendRequest): string {
  const categoryLabel = request.category === 'custom' && request.customCategory
    ? request.customCategory
    : CATEGORY_LABELS[request.category];

  const examplesList = request.examples
    .map((ex, i) => `${i + 1}. ${ex}`)
    .join('\n');

  return `I'm looking for new ${categoryLabel} to check out. Here are some I already know and love:

${examplesList}

Based on what these say about my taste, recommend 3 ${categoryLabel} I probably haven't tried yet. Remember — I want to be surprised, not just given the obvious next pick. Show me the connections I wouldn't have seen on my own.`;
}

// ============================================================
// STRUCTURED OUTPUT SCHEMA
// ============================================================

const RECOMMENDATION_SCHEMA = {
  type: 'object' as const,
  properties: {
    recommendations: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          title: { type: 'string' as const },
          creator: { type: 'string' as const },
          year: { type: 'integer' as const },
          genre: { type: 'string' as const },
          surpriseConnection: { type: 'string' as const },
          whyYoullLoveIt: { type: 'string' as const },
          moodTags: {
            type: 'array' as const,
            items: { type: 'string' as const },
          },
          surpriseRating: { type: 'integer' as const },
        },
        required: [
          'title', 'creator', 'year', 'genre',
          'surpriseConnection', 'whyYoullLoveIt',
          'moodTags', 'surpriseRating',
        ] as const,
        additionalProperties: false,
      },
    },
    analysisOfTaste: { type: 'string' as const },
    connectionThread: { type: 'string' as const },
  },
  required: ['recommendations', 'analysisOfTaste', 'connectionThread'] as const,
  additionalProperties: false,
};

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

  let body: RecommendRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!body.category || !body.examples?.length || !body.adventureLevel) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields: category, examples, adventureLevel' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (body.examples.length > 3) {
    return new Response(
      JSON.stringify({ error: 'Maximum 3 examples allowed' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicApiKey) {
    return new Response(
      JSON.stringify({ error: 'Anthropic API key not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const anthropic = new Anthropic({
      apiKey: anthropicApiKey,
      defaultHeaders: {
        'anthropic-beta': 'structured-outputs-2025-11-13',
      },
    });

    const systemPrompt = buildSystemPrompt(
      body.category,
      body.adventureLevel,
      body.customCategory,
      body.rollSeed
    );

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: buildUserPrompt(body),
        },
      ],
      output_config: {
        format: {
          type: 'json_schema',
          schema: RECOMMENDATION_SCHEMA,
        },
      },
    });

    const textBlock = message.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    const result = JSON.parse(textBlock.text);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Recommendation error:', err);
    return new Response(
      JSON.stringify({
        error: 'Failed to generate recommendations',
        details: err instanceof Error ? err.message : 'Unknown error',
      }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
