"use client";

import Link from "next/link";
import { BrandLogo } from "./brand-logo";

type ListingData = {
  id: string;
  name: string;
  github: string;
  type: string;
  avatar: string;
  stars: number;
  followers: number;
  forks: number;
  language: string | null;
  bio: string | null;
  boost: number;
  clicks: number;
  [key: string]: unknown;
};

export function ShareCard({ listing, rank }: { listing: ListingData; rank: number }) {
  const fmt = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
  };

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/share?id=${listing.id}`
    : "";

  const tweetText = `I'm ranked #${rank} on GitFlex with ${fmt(listing.stars)} stars. Can you beat me?`;

  const shareToTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
  };

  return (
    <main className="min-h-screen bg-gh-canvas flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Card preview */}
        <div className={`rounded-lg border-2 overflow-hidden mb-6 ${
          rank === 1 ? "border-gh-yellow" : rank === 2 ? "border-gh-text-secondary" : rank === 3 ? "border-gh-orange" : "border-gh-border"
        }`}>
          {/* Card header */}
          <div className="bg-gh-surface border-b border-gh-border px-5 py-3 flex items-center">
            <BrandLogo compact />
          </div>

          {/* Card body */}
          <div className="bg-gh-canvas p-6">
            <div className="flex items-center gap-5 mb-4">
              {/* Rank badge */}
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-mono font-bold text-xl ${
                rank === 1 ? "bg-[#e3b34118] text-gh-yellow border border-[#e3b34133]" :
                rank === 2 ? "bg-[#8b949e18] text-gh-text-secondary border border-[#8b949e33]" :
                rank === 3 ? "bg-[#d2992218] text-gh-orange border border-[#d2992233]" :
                "bg-[#30363d33] text-gh-text-muted border border-gh-border"
              }`}>
                #{rank}
              </div>

              <img src={listing.avatar} alt="" className="w-16 h-16 rounded-full border-2 border-gh-border" />

              <div>
                <h2 className="text-xl font-bold text-gh-text">{listing.name}</h2>
                <p className="text-sm text-gh-text-secondary">
                  {listing.type === "repo" ? listing.github : `@${listing.github}`}
                </p>
              </div>
            </div>

            {listing.bio && (
              <p className="text-sm text-gh-text-secondary mb-4">{listing.bio}</p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-gh-text-secondary mb-4">
              {listing.stars > 0 && (
                <span className="flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="#e3b341"><path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/></svg>
                  {fmt(listing.stars)} stars
                </span>
              )}
              {listing.followers > 0 && <span>{fmt(listing.followers)} followers</span>}
              {listing.forks > 0 && <span>{fmt(listing.forks)} forks</span>}
              {listing.language && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-gh-green-bright" />
                  {listing.language}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gh-border">
              <span className={`font-mono font-bold text-lg ${
                rank === 1 ? "text-gh-yellow" : "text-gh-green-bright"
              }`}>
                ${(listing.boost / 100).toLocaleString()}
              </span>
              <span className="text-xs text-gh-text-muted">{listing.clicks} clicks</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={shareToTwitter}
            className="flex-1 py-2.5 rounded-md bg-gh-green text-white font-semibold text-sm hover:bg-gh-green-bright transition-colors border border-gh-green-bright/20"
          >
            Share on X
          </button>
          <button
            onClick={copyLink}
            className="px-5 py-2.5 rounded-md bg-gh-surface border border-gh-border text-gh-text-secondary font-medium text-sm hover:text-gh-text hover:border-gh-text-muted transition-colors"
          >
            Copy link
          </button>
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="text-xs text-gh-blue hover:underline">
            Back to leaderboard
          </Link>
        </div>
      </div>
    </main>
  );
}
