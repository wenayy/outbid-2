"use client";

type Listing = {
  id: string;
  type: string;
  github: string;
  name: string;
  avatar: string;
  stars: number;
  forks: number;
  followers: number;
  repos: number;
  language: string | null;
  bio: string | null;
  url: string;
  boost: number;
  clicks: number;
};

export function ListingCard({ listing, rank }: { listing: Listing; rank: number }) {
  const handleClick = async () => {
    fetch("/api/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: listing.id }),
    });
    window.open(listing.url, "_blank", "noopener");
  };

  return (
    <button
      onClick={handleClick}
      className="w-full text-left group"
    >
      <div className="flex items-center gap-4 p-4 md:p-5 bg-gh-surface border border-gh-border rounded-xl hover:border-gh-text-muted hover:bg-gh-overlay transition-all duration-200">
        {/* Rank */}
        <div className="shrink-0 w-8 text-center">
          <span className={`font-mono text-lg font-bold ${
            rank === 1 ? "text-amber-400" :
            rank === 2 ? "text-gh-text-secondary" :
            rank === 3 ? "text-amber-600" :
            "text-gh-text-muted"
          }`}>
            {rank}
          </span>
        </div>

        {/* Avatar */}
        <img
          src={listing.avatar}
          alt={listing.name}
          className="w-10 h-10 rounded-full shrink-0 border border-gh-border"
        />

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gh-text truncate">
              {listing.name}
            </span>
            <span className="text-xs text-gh-text-muted hidden sm:inline">
              {listing.type === "repo" ? listing.github : `@${listing.github}`}
            </span>
          </div>
          {listing.bio && (
            <p className="text-xs text-gh-text-secondary truncate mt-0.5">
              {listing.bio}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-5 shrink-0">
          {listing.stars > 0 && (
            <div className="text-right">
              <p className="text-sm font-mono font-semibold text-gh-text">
                {listing.stars.toLocaleString()}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-gh-text-muted">stars</p>
            </div>
          )}
          {listing.followers > 0 && (
            <div className="text-right">
              <p className="text-sm font-mono font-semibold text-gh-text">
                {listing.followers.toLocaleString()}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-gh-text-muted">followers</p>
            </div>
          )}
          {listing.forks > 0 && (
            <div className="text-right">
              <p className="text-sm font-mono font-semibold text-gh-text">
                {listing.forks.toLocaleString()}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-gh-text-muted">forks</p>
            </div>
          )}
          {listing.language && (
            <div className="text-right">
              <p className="text-xs font-medium text-gh-text-secondary">
                {listing.language}
              </p>
            </div>
          )}
        </div>

        {/* Clicks */}
        <div className="hidden sm:block text-right shrink-0 w-16">
          <p className="text-sm font-mono text-gh-text-secondary">{listing.clicks}</p>
          <p className="text-[10px] uppercase tracking-wider text-gh-text-muted">clicks</p>
        </div>

        {/* Boost */}
        <div className="shrink-0 text-right">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gh-green/10 border border-gh-green-bright/20 text-gh-green-bright text-sm font-mono font-semibold">
            ${(listing.boost / 100).toFixed(0)}
          </span>
        </div>
      </div>
    </button>
  );
}
