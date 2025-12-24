export function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="absolute top-0 left-0 z-50 bg-primary text-primary-foreground px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      <a
        href="#main-navigation"
        className="absolute top-0 left-32 z-50 bg-primary text-primary-foreground px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to navigation
      </a>
    </div>
  );
}

