import { Board } from "@/components/board";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Nav — GitHub style */}
      <nav className="bg-gh-surface border-b border-gh-border transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 16 16" className="fill-gh-text">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            <span className="text-base font-semibold text-gh-text tracking-tight">
              GitFlex
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gh-text-secondary">
            <a href="#leaderboard" className="hover:text-gh-text transition-colors duration-150">Leaderboard</a>
            <Link href="/about" className="hover:text-gh-text transition-colors duration-150 hidden sm:block">About</Link>
            <Link href="/rules" className="hover:text-gh-text transition-colors duration-150 hidden sm:block">Rules</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <Board />

        {/* Footer */}
        <div className="mt-16 pt-6 border-t border-gh-border text-center space-y-2">
          <div className="flex items-center justify-center gap-4 text-xs text-gh-text-muted">
            <Link href="/about" className="hover:text-gh-text transition-colors duration-150">About</Link>
            <span>·</span>
            <Link href="/rules" className="hover:text-gh-text transition-colors duration-150">Rules</Link>
            <span>·</span>
            <span>gitflex.dev</span>
          </div>
          <p className="text-xs text-gh-text-muted max-w-lg mx-auto leading-relaxed">
            The developer leaderboard where your GitHub speaks for itself.
            List your profile or repo, set your bid, and climb the ranks.
          </p>
        </div>
      </div>
    </main>
  );
}
