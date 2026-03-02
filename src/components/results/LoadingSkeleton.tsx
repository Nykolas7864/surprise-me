const LOADING_MESSAGES = [
  'Digging through our archives...',
  'Connecting the dots between your picks...',
  'Finding hidden gems just for you...',
  'Consulting the recommendation oracle...',
  'Analyzing your taste profile...',
  'Unearthing something unexpected...',
];

export function LoadingSkeleton() {
  const message = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Loading message */}
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-3 glass rounded-full px-6 py-3">
          <span className="animate-dice-spin inline-block text-2xl">&#x1F3B2;</span>
          <span className="text-text-secondary text-sm">{message}</span>
        </div>
      </div>

      {/* Skeleton cards */}
      {[1, 2, 3].map((i) => (
        <div key={i} className={`glass rounded-2xl overflow-hidden animate-fade-up delay-${i * 100}`}>
          <div className="flex">
            <div className="w-32 sm:w-40 min-h-[220px] animate-shimmer shrink-0" />
            <div className="flex-1 p-5 space-y-3">
              <div className="h-5 w-3/4 rounded animate-shimmer" />
              <div className="h-4 w-1/2 rounded animate-shimmer" />
              <div className="h-20 rounded-lg animate-shimmer" />
              <div className="h-16 rounded animate-shimmer" />
              <div className="flex gap-2">
                <div className="h-6 w-20 rounded-full animate-shimmer" />
                <div className="h-6 w-16 rounded-full animate-shimmer" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
