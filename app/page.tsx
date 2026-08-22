import { Board } from "@/components/board";
import { BrandLogo } from "@/components/brand-logo";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Nav — GitHub style */}
      <nav className="bg-gh-surface border-b border-gh-border transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" aria-label="GitFlex home">
            <BrandLogo />
          </Link>
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
