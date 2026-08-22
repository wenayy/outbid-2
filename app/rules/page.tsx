import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export const metadata = {
  title: "Rules — GitFlex",
  description: "Rules and guidelines for the GitFlex leaderboard.",
};

export default function RulesPage() {
  return (
    <main className="min-h-screen">
      <nav className="bg-gh-surface border-b border-gh-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" aria-label="GitFlex home">
            <BrandLogo />
          </Link>
          <div className="flex items-center gap-5 text-sm text-gh-text-secondary">
            <Link href="/" className="hover:text-gh-text transition-colors">Leaderboard</Link>
            <Link href="/about" className="hover:text-gh-text transition-colors">About</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-gh-text mb-6">Rules</h1>

        <div className="space-y-4">
          <div className="bg-gh-surface border border-gh-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gh-text mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-gh-green/20 text-gh-green-bright flex items-center justify-center text-xs font-bold">1</span>
              Getting on the board
            </h2>
            <ul className="space-y-2 text-sm text-gh-text-secondary">
              <li>The minimum bid to get listed is <strong className="text-gh-text">$0.50</strong>.</li>
              <li>You can list a <strong className="text-gh-text">GitHub user profile</strong> or a <strong className="text-gh-text">GitHub repository</strong>.</li>
              <li>Your rank is determined by your bid amount — higher bid = higher rank.</li>
              <li>No signup or login required. Just paste your GitHub and pay.</li>
            </ul>
          </div>

          <div className="bg-gh-surface border border-gh-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gh-text mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-gh-yellow/20 text-gh-yellow flex items-center justify-center text-xs font-bold">2</span>
              Claiming a spot
            </h2>
            <ul className="space-y-2 text-sm text-gh-text-secondary">
              <li>To take someone&apos;s position, you must pay <strong className="text-gh-text">exactly $1 more</strong> than their current bid.</li>
              <li>When you claim a spot, the previous holder gets pushed down one rank.</li>
              <li>You can claim <strong className="text-gh-text">any position</strong> on the board, not just #1.</li>
              <li>The same profile can increase their bid to move up without re-listing.</li>
            </ul>
          </div>

          <div className="bg-gh-surface border border-gh-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gh-text mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-gh-blue/20 text-gh-blue flex items-center justify-center text-xs font-bold">3</span>
              What you get
            </h2>
            <ul className="space-y-2 text-sm text-gh-text-secondary">
              <li>Your listing links directly to your GitHub — every click is tracked.</li>
              <li>Your <strong className="text-gh-text">stars, forks, followers, commits, and contribution graph</strong> are displayed publicly.</li>
              <li>You get a <strong className="text-gh-text">shareable card</strong> with your rank that you can post on X/Twitter.</li>
              <li>Your listing generates an <strong className="text-gh-text">Open Graph image</strong> for rich link previews.</li>
            </ul>
          </div>

          <div className="bg-gh-surface border border-gh-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gh-text mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-gh-orange/20 text-gh-orange flex items-center justify-center text-xs font-bold">4</span>
              Fair play
            </h2>
            <ul className="space-y-2 text-sm text-gh-text-secondary">
              <li>Only real GitHub profiles and repos are allowed. Fake or spam listings will be removed.</li>
              <li>All payments are final and non-refundable.</li>
              <li>Listings stay active indefinitely unless removed for violating these rules.</li>
              <li>GitFlex reserves the right to remove any listing at its discretion.</li>
            </ul>
          </div>

          <div className="bg-gh-surface border border-gh-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gh-text mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-gh-red/20 text-gh-red flex items-center justify-center text-xs font-bold">5</span>
              Payments
            </h2>
            <ul className="space-y-2 text-sm text-gh-text-secondary">
              <li>Payments are processed securely through <strong className="text-gh-text">Polar.sh</strong>.</li>
              <li>We accept all major credit/debit cards.</li>
              <li>Your listing goes live immediately after successful payment.</li>
            </ul>
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
