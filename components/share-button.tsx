"use client";

export function ShareButton() {
  return (
    <button
      onClick={() => {
        const text = "I'm flexing my GitHub on gitflex — check where I rank";
        const url = window.location.origin;
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          "_blank"
        );
      }}
      className="inline-flex items-center justify-center px-6 py-2.5 rounded-md border border-gh-border text-gh-text-secondary font-medium text-sm hover:border-gh-text-muted hover:text-gh-text transition-colors"
    >
      Share on X
    </button>
  );
}
