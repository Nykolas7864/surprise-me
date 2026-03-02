// ============================================================
// MEDIA CATEGORIES
// ============================================================

export type MediaCategory = 'movies' | 'tv' | 'anime' | 'books' | 'manga' | 'music' | 'custom';

export interface CategoryOption {
  id: MediaCategory;
  label: string;
  icon: string;
  description: string;
  actionVerb: string;
  enrichable: boolean;
  enabled: boolean;
}

// ============================================================
// ADVENTURE LEVELS
// ============================================================

export interface AdventureLevel {
  level: number;
  label: string;
  icon: string;
  description: string;
}

// ============================================================
// REQUEST / RESPONSE TYPES
// ============================================================

export interface RecommendRequest {
  category: MediaCategory;
  examples: string[];
  adventureLevel: number;
  customCategory?: string;
  rollSeed?: number;
}

export interface EnrichRequest {
  titles: EnrichTitle[];
}

export interface EnrichTitle {
  title: string;
  creator: string;
  year: number;
}

// ============================================================
// AI RESPONSE TYPES
// ============================================================

export interface AIRecommendation {
  title: string;
  creator: string;
  year: number;
  genre: string;
  surpriseConnection: string;
  whyYoullLoveIt: string;
  moodTags: string[];
  surpriseRating: number;
}

export interface RecommendResponse {
  recommendations: AIRecommendation[];
  analysisOfTaste: string;
  connectionThread: string;
}

// ============================================================
// ENRICHMENT TYPES
// ============================================================

export interface EnrichedMetadata {
  title: string;
  imageUrl?: string;
  externalRating?: number;
  externalRatingSource?: string;
  extraInfo: Record<string, string>;
  actionUrl?: string;
  actionLabel?: string;
}

// ============================================================
// DISPLAY TYPES (AI + Enrichment merged)
// ============================================================

export interface DisplayRecommendation extends AIRecommendation {
  enrichment?: EnrichedMetadata;
  isEnriching: boolean;
}

// ============================================================
// THEME TYPES
// ============================================================

export interface CategoryTheme {
  primary: string;
  primaryHover: string;
  primaryMuted: string;
  accentLight: string;
  accentPale: string;
  gradientFrom: string;
  gradientTo: string;
  glassRgb: string;
  shimmerLight: string;
  shimmerMid: string;
}
