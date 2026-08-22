import Link from "next/link";
import { FlexForm } from "@/components/flex-form";

export const metadata = {
  title: "Flex Your GitHub — GitFlex",
};

export default function FlexPage() {
  return (
    <main className="flex-1">
      <div className="max-w-3xl mx-auto px-4 py-10 md:py-16">
        {/* Back */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-gh-text-secondary hover:text-gh-text transition-colors"
          >
            &larr; Back to leaderboard
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
            Flex your GitHub
          </h1>
          <p className="text-gh-text-secondary text-sm">
            Paste your username or repo. Pick a boost. Get on the board.
          </p>
        </div>

        <FlexForm />

        {/* How it works */}
        <div className="mt-16 pt-8 border-t border-gh-border">
          <h2 className="text-sm font-semibold text-gh-text-secondary mb-4 text-center">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: "1", title: "Paste your GitHub", desc: "Username or repository URL" },
              { step: "2", title: "Pick your boost", desc: "Higher boost = higher rank" },
              { step: "3", title: "Get on the board", desc: "Instant listing with click tracking" },
            ].map((item) => (
              <div key={item.step} className="text-center p-4">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gh-surface border border-gh-border text-gh-text-secondary font-mono text-sm mb-3">
                  {item.step}
                </div>
                <p className="text-sm font-medium text-gh-text">{item.title}</p>
                <p className="text-xs text-gh-text-secondary mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
