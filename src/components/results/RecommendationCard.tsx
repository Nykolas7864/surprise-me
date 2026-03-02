import type { DisplayRecommendation } from '../../types/index.ts';

interface RecommendationCardProps {
  rec: DisplayRecommendation;
  index: number;
  actionVerb: string;
}

function SurpriseDice({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`text-sm ${i < rating ? 'opacity-100' : 'opacity-20'}`}
        >
          &#x1F3B2;
        </span>
      ))}
    </div>
  );
}

function MoodTag({ tag }: { tag: string }) {
  return (
    <span className="inline-block rounded-full border border-primary/30
                     bg-primary/10 px-3 py-1 text-xs font-medium text-primary-muted">
      {tag}
    </span>
  );
}

export function RecommendationCard({ rec, index, actionVerb }: RecommendationCardProps) {
  const delayClass = `delay-${(index + 1) * 200}`;
  const enrichment = rec.enrichment;
  const hasImage = enrichment?.imageUrl;

  return (
    <div
      className={`glass rounded-2xl overflow-hidden animate-fade-up ${delayClass}
                  transition-all duration-300
                  hover:-translate-y-1 hover:shadow-[0_4px_24px_rgba(var(--glass-rgb,139,92,246),0.15)]`}
    >
      <div className="flex">
        {/* Poster/Cover Image */}
        <div className="w-40 sm:w-48 shrink-0">
          {hasImage ? (
            <img
              src={enrichment.imageUrl}
              alt={rec.title}
              className="w-full h-full object-cover animate-fade-in"
              loading="lazy"
            />
          ) : (
            <div className={`w-full h-full min-h-[240px] flex items-center justify-center
                            ${rec.isEnriching ? 'animate-shimmer' : 'bg-surface'}`}>
              {!rec.isEnriching && (
                <span className="text-4xl opacity-30">&#x1F3AC;</span>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-5 space-y-3">
          {/* Title + Meta */}
          <div>
            <h3 className="text-lg font-bold text-text-primary leading-tight">
              {rec.title}
              <span className="text-text-muted font-normal ml-2">({rec.year})</span>
            </h3>
            <p className="text-sm text-text-secondary mt-0.5">
              by {rec.creator}
            </p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="inline-block rounded-full bg-primary/15 border border-primary/25
                             px-2.5 py-0.5 text-xs font-medium text-primary-muted">
                {rec.genre}
              </span>
              {enrichment?.externalRating && (
                <span className="text-sm text-text-secondary">
                  &#x2B50; {enrichment.externalRating}
                  <span className="text-text-muted text-xs ml-1">
                    ({enrichment.externalRatingSource})
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* Surprise Rating */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Surprise Level:</span>
            <SurpriseDice rating={rec.surpriseRating} />
          </div>

          {/* Surprise Connection */}
          <div className="rounded-lg bg-primary/8 border border-primary/15 p-3">
            <p className="text-xs font-semibold text-primary-muted mb-1 uppercase tracking-wider">
              &#x2728; Surprise Connection
            </p>
            <p className="text-sm text-text-primary/90 leading-relaxed">
              {rec.surpriseConnection}
            </p>
          </div>

          {/* Why You'll Love It */}
          <div>
            <p className="text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wider">
              &#x1F4A1; Why You'll Love It
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">
              {rec.whyYoullLoveIt}
            </p>
          </div>

          {/* Mood Tags */}
          <div className="flex flex-wrap gap-1.5">
            {rec.moodTags.map((tag) => (
              <MoodTag key={tag} tag={tag} />
            ))}
          </div>

          {/* Extra Info from enrichment */}
          {enrichment && Object.keys(enrichment.extraInfo).length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
              {Object.entries(enrichment.extraInfo).map(([key, value]) => (
                <span key={key}>
                  <span className="text-text-secondary capitalize">{key}:</span> {value}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2 border-t border-border">
            {rec.isEnriching && (
              <span className="text-xs text-text-muted animate-pulse-soft flex items-center gap-1.5">
                <span className="animate-dice-spin inline-block text-sm">&#x1F3B2;</span>
                Fetching details…
              </span>
            )}
            {enrichment?.actionUrl && (
              <a
                href={enrichment.actionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg
                          bg-gradient-to-r from-[var(--color-gradient-from)] to-[var(--color-gradient-to)]
                          px-4 py-2 text-sm font-semibold text-white
                          hover:shadow-[0_0_16px_rgba(var(--glass-rgb,139,92,246),0.4)]
                          transition-all duration-200 animate-fade-in"
              >
                {enrichment.actionLabel || `${actionVerb} Now`}
              </a>
            )}
            {!enrichment?.actionUrl && !rec.isEnriching && (
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(rec.title + ' ' + rec.year)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg
                          border border-primary/30 bg-primary/10
                          px-4 py-2 text-sm font-medium text-primary-muted
                          hover:bg-primary/20 transition-all duration-200"
              >
                &#x1F50D; Search Online
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
