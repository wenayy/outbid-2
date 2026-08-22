"use client";

import { useEffect, useState, useCallback } from "react";
import { StatsBar } from "./stats-bar";
import { ListingCard } from "./listing-card";

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

type Meta = {
  totalStars: number;
  totalListings: number;
  totalBoosted: number;
  totalViews: number;
};

export function Leaderboard() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [meta, setMeta] = useState<Meta>({
    totalStars: 0,
    totalListings: 0,
    totalBoosted: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/listings");
      const data = await res.json();
      setListings(data.listings);
      setMeta(data.meta);
    } catch (e) {
      console.error("Failed to fetch listings:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void fetchData());
    const interval = setInterval(() => void fetchData(), 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="space-y-8">
      <StatsBar
        totalStars={meta.totalStars}
        totalListings={meta.totalListings}
        totalBoosted={meta.totalBoosted}
        totalViews={meta.totalViews}
      />

      <div className="space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-[72px] bg-gh-overlay/30 border border-gh-border rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gh-text-secondary text-lg">No one&apos;s flexing yet.</p>
            <p className="text-gh-text-muted text-sm mt-1">Be the first on the board.</p>
          </div>
        ) : (
          listings.map((listing, i) => (
            <ListingCard key={listing.id} listing={listing} rank={i + 1} />
          ))
        )}
      </div>
    </div>
  );
}
