export function Footer() {
  return (
    <footer className="w-full py-6 px-4 text-center border-t border-border mt-auto">
      <p className="text-xs text-text-muted">
        Built by{' '}
        <a
          href="https://kishxi.netlify.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary-hover transition-colors duration-200"
        >
          Kishxi
        </a>
        {' '}&middot; Powered by Claude AI
      </p>
    </footer>
  );
}
