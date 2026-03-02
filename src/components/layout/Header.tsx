export function Header() {
  return (
    <header className="w-full py-6 px-4 text-center">
      <div className="animate-fade-up">
        <h1 className="text-4xl sm:text-5xl font-extrabold">
          <span className="bg-gradient-to-r from-[var(--color-gradient-from)] to-[var(--color-gradient-to)]
                         bg-clip-text text-transparent animate-gradient">
            Surprise Me!
          </span>
        </h1>
        <p className="text-text-secondary mt-2 text-sm sm:text-base">
          Discover media you never knew you needed
        </p>
      </div>
    </header>
  );
}
