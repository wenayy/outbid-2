import Link from "next/link";

export const metadata = {
  title: "About — GitFlex",
  description: "Learn about GitFlex, the live developer leaderboard.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <nav className="bg-gh-surface border-b border-gh-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 16 16" className="fill-gh-text">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            <span className="text-base font-semibold text-gh-text tracking-tight">GitFlex</span>
          </Link>
          <div className="flex items-center gap-5 text-sm text-gh-text-secondary">
            <Link href="/" className="hover:text-gh-text transition-colors">Leaderboard</Link>
            <Link href="/rules" className="hover:text-gh-text transition-colors">Rules</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-gh-text mb-6">About GitFlex</h1>

        <div className="space-y-6 text-sm text-gh-text-secondary leading-relaxed">
          <div className="bg-gh-surface border border-gh-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gh-text mb-3">What is GitFlex?</h2>
            <p>
              GitFlex is a live leaderboard where developers pay to rank their GitHub profile or repository.
              Think of it as a billboard for developers — the more you bid, the higher you rank, and the more
              visibility you get from the developer community.
            </p>
          </div>

          <div className="bg-gh-surface border border-gh-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gh-text mb-3">How does it work?</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li><strong className="text-gh-text">Paste your GitHub</strong> — Enter your GitHub username or repo URL</li>
              <li><strong className="text-gh-text">Set your bid</strong> — Minimum $0.50 to get on the board</li>
              <li><strong className="text-gh-text">Claim your rank</strong> — Your position is determined by your bid amount</li>
              <li><strong className="text-gh-text">Get traffic</strong> — Your listing links to your GitHub, driving real clicks</li>
            </ol>
          </div>

          <div className="bg-gh-surface border border-gh-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gh-text mb-3">Why GitFlex?</h2>
            <ul className="space-y-2">
              <li><strong className="text-gh-text">Zero friction</strong> — No signup, no login. Just paste and pay.</li>
              <li><strong className="text-gh-text">Real metrics</strong> — We pull your stars, commits, forks, and contribution history directly from GitHub.</li>
              <li><strong className="text-gh-text">Shareable cards</strong> — Every listing gets a branded share card you can post on X/Twitter.</li>
              <li><strong className="text-gh-text">Competitive</strong> — Someone took your spot? Outbid them with just $1 more.</li>
            </ul>
          </div>

          <div className="bg-gh-surface border border-gh-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gh-text mb-3">Who is this for?</h2>
            <p>
              Open source maintainers, indie hackers, developer advocates, or anyone who wants to flex their GitHub
              presence. Whether you have 10 stars or 100k, GitFlex is your stage.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-gh-green text-white font-semibold text-sm hover:bg-gh-green-bright transition-all duration-200 border border-gh-green-bright/20">
            Back to Leaderboard
          </Link>
        </div>
      </div>
    </main>
  );
}
