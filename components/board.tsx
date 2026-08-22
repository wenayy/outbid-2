"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ContribGrid } from "./contrib-grid";
import { DEMO_LISTINGS } from "@/lib/demo-listings";

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
  createdAt: string;
};

type Meta = {
  totalStars: number;
  totalListings: number;
  totalBoosted: number;
  totalViews: number;
};

type GHData = {
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
};

function TierHeader({ label, count, demo }: { label: string; count: number; demo: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-gh-overlay/60 border-b border-gh-border">
      <span className="text-xs font-bold text-gh-text tracking-wide uppercase">{label}</span>
      <span className="flex-1 h-px bg-gh-border" />
      <span className="text-xs text-gh-text-secondary tabular-nums font-medium">{count} {demo ? "examples" : "listed"}</span>
    </div>
  );
}

export function Board() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [meta, setMeta] = useState<Meta>({ totalStars: 0, totalListings: 0, totalBoosted: 0, totalViews: 0 });
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const [boardMode, setBoardMode] = useState<"live" | "demo">("demo");
  const modeInitializedRef = useRef(false);
  const handledListingHashRef = useRef("");
  const linkedListingElementRef = useRef<HTMLElement | null>(null);

  const [heroInput, setHeroInput] = useState("");
  const [heroData, setHeroData] = useState<GHData | null>(null);
  const [heroLooking, setHeroLooking] = useState(false);
  const [heroError, setHeroError] = useState("");
  const [heroStep, setHeroStep] = useState<"input" | "preview">("input");
  const [heroBid, setHeroBid] = useState("0.50");
  const [heroSubmitting, setHeroSubmitting] = useState(false);
  const heroInputRef = useRef<HTMLInputElement>(null);

  const [outbidTarget, setOutbidTarget] = useState<{ rank: number; listing: Listing } | null>(null);
  const [outbidInput, setOutbidInput] = useState("");
  const [outbidData, setOutbidData] = useState<GHData | null>(null);
  const [outbidLooking, setOutbidLooking] = useState(false);
  const [outbidStep, setOutbidStep] = useState<"github" | "pay">("github");
  const [outbidBid, setOutbidBid] = useState("");
  const [outbidSubmitting, setOutbidSubmitting] = useState(false);
  const [outbidError, setOutbidError] = useState("");
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/listings");
      const data = await res.json();
      setListings(data.listings);
      setMeta(data.meta);
      if (!modeInitializedRef.current) {
        setBoardMode(data.listings.length > 0 ? "live" : "demo");
        modeInitializedRef.current = true;
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetch("/api/view", { method: "POST" })
        .catch((error) => console.error(error))
        .finally(() => void fetchData());
    });
    const iv = setInterval(() => void fetchData(), 8000);
    return () => clearInterval(iv);
  }, [fetchData]);

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (loading || typeof window === "undefined") return;

    const hash = window.location.hash;
    if (!hash.startsWith("#listing-") || handledListingHashRef.current === hash) return;

    const listingId = hash.slice("#listing-".length);
    if (!listings.some((listing) => listing.id === listingId)) return;

    handledListingHashRef.current = hash;
    let frame = 0;
    const timeout = window.setTimeout(() => {
      setBoardMode("live");
      frame = window.requestAnimationFrame(() => {
        const target = document.getElementById(`listing-${listingId}`);
        linkedListingElementRef.current?.classList.remove("listing-linked");
        target?.classList.add("listing-linked");
        linkedListingElementRef.current = target;
        target?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    }, 0);

    return () => {
      window.clearTimeout(timeout);
      window.cancelAnimationFrame(frame);
    };
  }, [loading, listings]);

  // Find the next price that isn't already taken
  const takenPrices = new Set(listings.map((l) => l.boost));
  const nextAvailablePrice = (startCents: number) => {
    let price = startCents;
    while (takenPrices.has(price)) price += 100;
    return price;
  };

  const topBid = listings.length > 0 ? listings[0].boost : 0;
  const claimPrice = listings.length > 0 ? nextAvailablePrice(topBid + 100) : 50;
  // Minimum new bid = next available above lowest, or $0.50 if empty
  const lowestBid = listings.length > 0 ? listings[listings.length - 1].boost : 0;
  const minNewBid = nextAvailablePrice(lowestBid > 0 ? lowestBid + 100 : 50);

  const fmt = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
  };

  const fmtDollars = (cents: number) => {
    if (cents >= 100) return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    return `$${(cents / 100).toFixed(2)}`;
  };

  const timeAgo = (dateStr: string) => {
    const diff = now - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const heroLookup = async () => {
    if (!heroInput.trim()) return;
    setHeroLooking(true);
    setHeroError("");
    try {
      const res = await fetch(`/api/github?q=${encodeURIComponent(heroInput.trim())}`);
      const data = await res.json();
      if (!res.ok) { setHeroError(data.error || "Not found on GitHub"); return; }
      setHeroData(data);
      setHeroStep("preview");
      setHeroBid((minNewBid / 100).toFixed(2));
    } catch { setHeroError("Could not find that profile."); }
    finally { setHeroLooking(false); }
  };

  const heroSubmit = async () => {
    if (!heroData) return;
    const cents = Math.round(parseFloat(heroBid) * 100);
    if (isNaN(cents) || cents < 50) { setHeroError("Minimum is $0.50"); return; }
    if (listings.some((l) => l.boost === cents)) {
      setHeroError(`Someone already bid ${fmtDollars(cents)}. Try ${fmtDollars(cents + 100)} instead.`);
      return;
    }
    setHeroSubmitting(true);
    setHeroError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...heroData, boost: cents }),
      });
      const data = await res.json();
      if (!res.ok) { setHeroError(data.error || "Failed"); return; }
      if (data.checkoutUrl) { window.location.href = data.checkoutUrl; return; }
      setHeroStep("input");
      setHeroInput("");
      setHeroData(null);
      fetchData();
    } catch { setHeroError("Something went wrong."); }
    finally { setHeroSubmitting(false); }
  };

  const outbidLookup = async () => {
    if (!outbidInput.trim()) return;
    setOutbidLooking(true);
    setOutbidError("");
    try {
      const res = await fetch(`/api/github?q=${encodeURIComponent(outbidInput.trim())}`);
      const data = await res.json();
      if (!res.ok) { setOutbidError(data.error || "Not found"); return; }
      setOutbidData(data);
      setOutbidStep("pay");
    } catch { setOutbidError("Could not find that profile."); }
    finally { setOutbidLooking(false); }
  };

  const outbidSubmit = async () => {
    if (!outbidData || !outbidTarget) return;
    const cents = Math.round(parseFloat(outbidBid) * 100);
    if (isNaN(cents) || cents < 50) { setOutbidError("Minimum bid is $0.50"); return; }
    if (listings.some((l) => l.boost === cents)) {
      setOutbidError(`Someone already bid ${fmtDollars(cents)}. Try ${fmtDollars(cents + 100)} instead.`);
      return;
    }
    setOutbidSubmitting(true);
    setOutbidError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...outbidData, boost: cents }),
      });
      const data = await res.json();
      if (!res.ok) { setOutbidError(data.error || "Failed"); return; }
      if (data.checkoutUrl) { window.location.href = data.checkoutUrl; return; }
      setOutbidTarget(null);
      fetchData();
    } catch { setOutbidError("Something went wrong."); }
    finally { setOutbidSubmitting(false); }
  };

  const openOutbid = (rank: number, listing: Listing) => {
    const minBid = nextAvailablePrice(listing.boost + 100);
    setOutbidTarget({ rank, listing });
    setOutbidInput("");
    setOutbidData(null);
    setOutbidStep("github");
    setOutbidBid((minBid / 100).toFixed(2));
    setOutbidError("");
  };

  // Predicted rank for hero bid
  const heroBidCents = Math.round(parseFloat(heroBid) * 100) || 0;
  const heroPredictedRank = heroBidCents > 0
    ? listings.filter((l) => l.boost >= heroBidCents).length + 1
    : listings.length + 1;
  const heroRankColor = heroPredictedRank === 1 ? "text-gh-yellow" : heroPredictedRank <= 3 ? "text-gh-orange" : "text-gh-green-bright";
  const heroSameBidCount = heroBidCents > 0 ? listings.filter((l) => l.boost === heroBidCents).length : 0;

  // Predicted rank for outbid modal
  const outbidCents = Math.round(parseFloat(outbidBid) * 100) || 0;
  const outbidPredictedRank = outbidCents > 0
    ? listings.filter((l) => l.boost >= outbidCents).length + 1
    : listings.length + 1;
  const outbidRankColor = outbidPredictedRank === 1 ? "text-gh-yellow" : outbidPredictedRank <= 3 ? "text-gh-orange" : "text-gh-green-bright";
  const outbidSameBidCount = outbidCents > 0 ? listings.filter((l) => l.boost === outbidCents).length : 0;

  const isDemo = boardMode === "demo";
  const displayedListings = isDemo ? DEMO_LISTINGS : listings;

  // Tier slices for leaderboard sections (top 3 are featured cards)
  const tier4to10 = displayedListings.slice(3, 10);
  const tier11to20 = displayedListings.slice(10, 20);
  const tier21to50 = displayedListings.slice(20, 50);
  const tierRest = displayedListings.slice(50);
  const ITEMS_PER_PAGE = 50;
  const totalPages = Math.ceil(tierRest.length / ITEMS_PER_PAGE);
  const pagedRest = tierRest.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const trackClick = (id: string, url: string) => {
    fetch("/api/click", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    window.open(url, "_blank", "noopener");
  };

  const openProfile = (listing: Listing) => {
    if (isDemo) {
      window.open(listing.url, "_blank", "noopener");
      return;
    }
    trackClick(listing.id, listing.url);
  };

  const startRealListing = () => {
    setBoardMode("live");
    setPage(1);
    requestAnimationFrame(() => {
      heroInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      heroInputRef.current?.focus({ preventScroll: true });
    });
  };

  const changeBoardMode = (mode: "live" | "demo") => {
    setBoardMode(mode);
    setPage(1);
  };

  const ShareIcon = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M3.5 3.75a.25.25 0 01.25-.25h6.5a.25.25 0 01.25.25v1a.75.75 0 001.5 0v-1A1.75 1.75 0 0010.25 2h-6.5A1.75 1.75 0 002 3.75v8.5c0 .966.784 1.75 1.75 1.75h6.5A1.75 1.75 0 0012 12.25v-1a.75.75 0 00-1.5 0v1a.25.25 0 01-.25.25h-6.5a.25.25 0 01-.25-.25v-8.5zm5.47 7.28a.75.75 0 001.06 0l3.25-3.25a.75.75 0 000-1.06L10.03 3.47a.75.75 0 10-1.06 1.06l1.97 1.97H5.75a.75.75 0 000 1.5h5.19l-1.97 1.97a.75.75 0 000 1.06z"/></svg>
  );

  return (
    <>
      {/* Stats pill */}
      <div className="flex justify-center mb-6 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gh-surface border border-gh-border text-xs text-gh-text-secondary">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-gh-green-bright animate-pulse" />
          <span><strong className="text-gh-text tabular-nums">{fmt(meta.totalViews)}</strong> visitors</span>
          <span className="text-gh-text-muted">·</span>
          <span><strong className="text-gh-text tabular-nums">{meta.totalListings}</strong> devs & repos listed</span>
        </div>
      </div>

      {/* Hero */}
      <div className="text-center mb-6 animate-fade-in-up delay-1">
        <h2 className="text-3xl md:text-5xl font-bold text-gh-text mb-2 tracking-tight">
          Claim #1 for{" "}
          <span className="text-gh-green-bright font-mono tabular-nums">
            {fmtDollars(claimPrice)}
          </span>
        </h2>
        <p className="text-gh-text-secondary text-sm max-w-md mx-auto">
          List your profile or repo. The higher you bid, the higher you rank. Next spot starts at <span className="text-gh-text font-medium">{fmtDollars(minNewBid)}</span>.
        </p>
      </div>

      {/* Hero input */}
      <div className="max-w-xl mx-auto mb-10 animate-fade-in-up delay-2">
        {heroStep === "input" ? (
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded border border-gh-green-bright/30 bg-gh-green/15 text-gh-green-bright">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                </svg>
              </span>
              <input
                ref={heroInputRef}
                type="text"
                placeholder="Enter @github-username or repo URL"
                value={heroInput}
                onChange={(e) => setHeroInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && heroLookup()}
                className="w-full pl-12 pr-4 py-2.5 bg-gh-canvas border border-gh-border rounded-md text-sm text-gh-text placeholder-gh-text-muted focus:outline-none focus:border-gh-blue focus:ring-1 focus:ring-gh-blue/30 transition-all duration-200"
              />
            </div>
            <button
              onClick={heroLookup}
              disabled={heroLooking || !heroInput.trim()}
              className="px-5 py-2.5 rounded-md bg-gh-green text-white font-semibold text-sm hover:bg-gh-green-bright transition-all duration-200 disabled:opacity-40 shrink-0 border border-gh-green-bright/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              {heroLooking ? "..." : "Get Listed"}
            </button>
          </div>
        ) : heroData ? (
          <div className="bg-gh-surface border border-gh-border rounded-lg p-5 animate-fade-in-up">
            {/* Profile card */}
            <div className="flex items-center gap-4 mb-4">
              <img src={heroData.avatar} alt="" className="w-14 h-14 rounded-full border-2 border-gh-border shadow-lg" />
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-gh-text truncate">{heroData.name}</p>
                <p className="text-xs text-gh-text-muted truncate">{heroData.type === "repo" ? heroData.github : `@${heroData.github}`}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-gh-text-secondary">
                  {heroData.stars > 0 && (
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" className="text-gh-yellow"><path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/></svg>
                      {fmt(heroData.stars)}
                    </span>
                  )}
                  {heroData.forks > 0 && (
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" className="text-gh-text-muted"><path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"/></svg>
                      {fmt(heroData.forks)}
                    </span>
                  )}
                  {heroData.followers > 0 && <span className="tabular-nums">{fmt(heroData.followers)} followers</span>}
                  {heroData.language && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-gh-green-bright" />
                      {heroData.language}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => { setHeroStep("input"); setHeroData(null); }} className="text-xs text-gh-blue hover:underline transition-colors shrink-0">Change</button>
            </div>

            {heroData.bio && (
              <p className="text-xs text-gh-text-secondary mb-4 line-clamp-2 border-l-2 border-gh-border pl-3 italic">{heroData.bio}</p>
            )}

            {/* Bid input + rank prediction */}
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gh-text-muted text-sm font-mono">$</span>
                <input
                  type="number"
                  min="0.50"
                  step="0.50"
                  value={heroBid}
                  onChange={(e) => setHeroBid(e.target.value)}
                  className="w-full pl-7 pr-3 py-2.5 bg-gh-canvas border border-gh-border rounded-md text-gh-text font-mono text-sm focus:outline-none focus:border-gh-blue focus:ring-1 focus:ring-gh-blue/30 transition-all duration-200"
                />
              </div>
              <button
                onClick={heroSubmit}
                disabled={heroSubmitting}
                className="px-5 py-2.5 rounded-md bg-gh-green text-white font-semibold text-sm hover:bg-gh-green-bright transition-all duration-200 disabled:opacity-40 shrink-0 border border-gh-green-bright/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                {heroSubmitting ? "..." : "Claim Spot"}
              </button>
            </div>

            {/* Rank prediction */}
            <div className="px-3 py-2 bg-gh-overlay rounded-md border border-gh-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gh-text-secondary">
                  {heroBidCents >= 50 ? "You'll land at" : "Enter a bid"}
                </span>
                {heroBidCents >= 50 && (
                  <span className={`font-mono font-bold text-sm tabular-nums ${heroRankColor}`}>
                    #{heroPredictedRank}
                    <span className="text-gh-text-muted font-normal text-xs ml-1">
                      of {listings.length + 1}
                    </span>
                  </span>
                )}
              </div>
              {heroSameBidCount > 0 && heroBidCents >= 50 && (
                <p className="text-[11px] text-gh-yellow mt-1">
                  {fmtDollars(heroBidCents)} is taken — try <span className="text-gh-green-bright font-medium">{fmtDollars(heroBidCents + 100)}</span>
                </p>
              )}
            </div>

            <p className="text-[11px] text-gh-text-muted text-center mt-3">
              Already listed? Enter the same username to increase your bid and move up.
            </p>
          </div>
        ) : null}
        {heroError && <p className="text-gh-red text-xs mt-2 text-center animate-fade-in-up">{heroError}</p>}
      </div>

      {/* Trending + Latest activity — side by side */}
      {listings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 animate-fade-in-up delay-3">
          {/* Trending right now */}
          <div className="bg-gh-surface border border-gh-border rounded-md overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gh-border bg-gh-overlay/50">
              <span className="text-sm font-semibold text-gh-text">Trending right now</span>
            </div>
            <div className="divide-y divide-gh-border">
              {[...listings]
                .sort((a, b) => b.clicks - a.clicks)
                .slice(0, 5)
                .map((l) => (
                  <div key={l.id} className="flex items-center justify-between px-4 py-2 hover:bg-gh-overlay/30 transition-colors duration-150">
                    <button onClick={() => trackClick(l.id, l.url)} className="flex items-center gap-2 min-w-0">
                      <img src={l.avatar} alt="" className="w-5 h-5 rounded-full shrink-0" />
                      <span className="text-sm text-gh-text font-medium truncate hover:text-gh-blue transition-colors duration-150">{l.name}</span>
                    </button>
                    <span className="text-xs text-gh-text-muted shrink-0 ml-2 tabular-nums">{l.clicks} clicks</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Latest activity */}
          <div className="bg-gh-surface border border-gh-border rounded-md overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gh-border bg-gh-overlay/50">
              <span className="w-1.5 h-1.5 rounded-full bg-gh-red animate-pulse" />
              <span className="text-sm font-semibold text-gh-text">Latest activity</span>
            </div>
            <div className="divide-y divide-gh-border">
              {listings.slice(0, 5).map((l, i) => (
                <div key={l.id} className="flex items-center justify-between px-4 py-2 hover:bg-gh-overlay/30 transition-colors duration-150">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={l.avatar} alt="" className="w-5 h-5 rounded-full shrink-0" />
                    <span className="text-sm text-gh-text-secondary truncate">
                      <strong className="text-gh-text">{l.name}</strong> at #{i + 1} · {fmtDollars(l.boost)}
                    </span>
                  </div>
                  <span className="text-xs text-gh-text-muted shrink-0 ml-2">{timeAgo(l.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Live/demo board selector */}
      {!loading && (
        <div className={`relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 px-4 py-3.5 bg-gh-surface border rounded-md animate-fade-in-up delay-4 transition-colors duration-300 ${isDemo ? "border-gh-blue/35" : "border-gh-green-bright/35"}`}>
          <span className={`absolute inset-y-3 left-0 w-0.5 rounded-r transition-colors duration-300 ${isDemo ? "bg-gh-blue" : "bg-gh-green-bright"}`} />
          <div className="min-w-0 pl-1">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full shrink-0 transition-colors duration-300 ${isDemo ? "bg-gh-blue" : "bg-gh-green-bright animate-pulse"}`} />
              <h3 className="text-sm font-semibold text-gh-text">{isDemo ? "Demo preview" : "Live leaderboard"}</h3>
              <span className={`hidden sm:inline-flex px-1.5 py-0.5 rounded border text-[10px] font-bold uppercase ${isDemo ? "text-gh-blue border-gh-blue/25 bg-gh-blue/10" : "text-gh-green-bright border-gh-green-bright/25 bg-gh-green/10"}`}>
                {isDemo ? "Examples" : "Open"}
              </span>
            </div>
            <p className="text-xs text-gh-text-secondary mt-1 leading-relaxed">
              {isDemo ? (
                <>Think you have a better profile or repo? Use these examples as the benchmark and <strong className="text-gh-text font-semibold">outbid them live.</strong></>
              ) : (
                <><strong className="text-gh-text font-semibold tabular-nums">{listings.length}</strong> real {listings.length === 1 ? "listing" : "listings"}. The next available spot starts at <strong className="text-gh-text font-semibold">{fmtDollars(minNewBid)}</strong>.</>
              )}
            </p>
          </div>
          <div className="relative grid grid-cols-2 self-stretch sm:self-auto w-full sm:w-56 h-10 p-1 bg-gh-canvas border border-gh-border rounded-md shrink-0" role="tablist" aria-label="Leaderboard view">
            <span
              aria-hidden="true"
              className={`absolute top-1 bottom-1 left-1 w-[calc(50%_-_4px)] rounded border shadow-sm transition-all duration-300 ease-out ${isDemo ? "translate-x-full bg-gh-blue/10 border-gh-blue/30" : "translate-x-0 bg-gh-green/10 border-gh-green-bright/30"}`}
            />
            <button
              type="button"
              role="tab"
              aria-selected={!isDemo}
              onClick={() => changeBoardMode("live")}
              className={`relative z-10 flex items-center justify-center gap-1.5 rounded text-xs font-semibold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-green-bright/60 ${!isDemo ? "text-gh-green-bright" : "text-gh-text-secondary hover:text-gh-text"}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${!isDemo ? "bg-gh-green-bright animate-pulse" : "bg-gh-text-muted"}`} />
              Live
              <span className={`min-w-5 px-1 py-0.5 rounded text-[10px] tabular-nums ${!isDemo ? "bg-gh-green/15 text-gh-green-bright" : "bg-gh-overlay text-gh-text-secondary"}`}>{listings.length}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isDemo}
              onClick={() => changeBoardMode("demo")}
              className={`relative z-10 flex items-center justify-center gap-1.5 rounded text-xs font-semibold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-blue/60 ${isDemo ? "text-gh-blue" : "text-gh-text-secondary hover:text-gh-text"}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ring-2 ring-offset-1 ring-offset-gh-canvas ${isDemo ? "bg-gh-blue ring-gh-blue/35" : "bg-gh-text-muted ring-gh-text-muted/25"}`} />
              Demo preview
            </button>
          </div>
        </div>
      )}

      {/* Top 3 Featured Cards */}
      {!loading && displayedListings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {displayedListings.slice(0, 3).map((l, i) => {
            const rank = i + 1;
            const borderColor = rank === 1 ? "border-gh-yellow" : rank === 2 ? "border-gh-text-secondary" : "border-gh-orange";
            const cardRankColor = rank === 1 ? "text-gh-yellow" : rank === 2 ? "text-gh-text-secondary" : "text-gh-orange";
            const badgeBg = rank === 1 ? "bg-[#e3b34118]" : rank === 2 ? "bg-[#8b949e18]" : "bg-[#d2992218]";
            return (
              <div
                key={l.id}
                id={!isDemo ? `listing-${l.id}` : undefined}
                className={`listing-target scroll-mt-20 relative bg-gh-surface border-2 ${borderColor} rounded-lg overflow-hidden card-hover`}
              >
                {rank === 1 && (
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gh-yellow to-transparent" />
                )}
                <div className="p-4">
                  {/* Type badge + rank */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-lg ${badgeBg} ${cardRankColor} border border-current/20`}>
                        #{rank}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        l.type === "repo"
                          ? "bg-gh-blue/10 text-gh-blue border-gh-blue/20"
                          : "bg-gh-purple/10 text-gh-purple border-gh-purple/20"
                      }`}>
                        {l.type === "repo" ? (
                          <span className="flex items-center gap-1">
                            <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1h-8a1 1 0 00-1 1v6.708A2.486 2.486 0 014.5 9h8V1.5z"/></svg>
                            Repository
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M10.561 8.073a6.005 6.005 0 013.432 5.142.75.75 0 11-1.498.07 4.5 4.5 0 00-8.99 0 .75.75 0 01-1.498-.07 6.004 6.004 0 013.431-5.142 3.999 3.999 0 115.123 0zM10.5 5a2.5 2.5 0 10-5 0 2.5 2.5 0 005 0z"/></svg>
                            Developer
                          </span>
                        )}
                      </span>
                    </div>
                    <span className="text-[11px] text-gh-text-muted tabular-nums">{isDemo ? "Example" : `${l.clicks} clicks`}</span>
                  </div>

                  {/* Avatar + name */}
                  <div className="flex items-center gap-3 mb-3">
                    <button onClick={() => openProfile(l)} className="group/avatar relative shrink-0">
                      <img src={l.avatar} alt="" className={`w-12 h-12 border-2 border-gh-border group-hover/avatar:border-gh-blue transition-all duration-200 group-hover/avatar:scale-105 ${l.type === "repo" ? "rounded-lg" : "rounded-full"}`} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <button onClick={() => openProfile(l)} className="text-sm font-bold text-gh-text hover:text-gh-blue truncate block transition-colors duration-150">{l.name}</button>
                      <p className="text-[11px] text-gh-text-muted truncate">{l.type === "repo" ? l.github : `@${l.github}`}</p>
                    </div>
                  </div>

                  {/* Bio / description */}
                  {l.bio && (
                    <p className="text-xs text-gh-text-secondary mb-3 line-clamp-2">{l.bio}</p>
                  )}

                  {/* Stats row */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gh-text-secondary mb-3">
                    {l.stars > 0 && (
                      <span className="flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" className="text-gh-yellow"><path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/></svg>
                        {fmt(l.stars)}
                      </span>
                    )}
                    {l.forks > 0 && (
                      <span className="flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" className="text-gh-text-muted"><path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"/></svg>
                        {fmt(l.forks)}
                      </span>
                    )}
                    {l.followers > 0 && <span className="tabular-nums">{fmt(l.followers)} followers</span>}
                    {l.repos > 0 && l.type === "user" && <span className="tabular-nums">{fmt(l.repos)} repos</span>}
                    {l.language && (
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-gh-green-bright" />
                        {l.language}
                      </span>
                    )}
                  </div>

                  {/* Contribution grid for users / prominent stats for repos */}
                  {l.type === "user" ? (
                    <div className="mb-3">
                      <ContribGrid username={l.github} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 mb-3 px-3 py-2.5 bg-gh-overlay rounded-md border border-gh-border">
                      {l.stars > 0 && (
                        <div className="flex flex-col items-center flex-1">
                          <span className="text-base font-bold text-gh-yellow tabular-nums">{fmt(l.stars)}</span>
                          <span className="text-[10px] text-gh-text-muted">stars</span>
                        </div>
                      )}
                      {l.forks > 0 && (
                        <div className="flex flex-col items-center flex-1">
                          <span className="text-base font-bold text-gh-text tabular-nums">{fmt(l.forks)}</span>
                          <span className="text-[10px] text-gh-text-muted">forks</span>
                        </div>
                      )}
                      {l.language && (
                        <div className="flex flex-col items-center flex-1">
                          <span className="flex items-center gap-1 text-sm font-semibold text-gh-text">
                            <span className="w-2.5 h-2.5 rounded-full bg-gh-green-bright" />
                            {l.language}
                          </span>
                          <span className="text-[10px] text-gh-text-muted">language</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-gh-border">
                    <span className={`font-mono font-bold text-lg tabular-nums ${cardRankColor}`}>
                      {fmtDollars(l.boost)}
                    </span>
                    <div className="flex items-center gap-2">
                      {!isDemo && (
                        <button
                          onClick={() => window.open(`/share?id=${l.id}`, "_blank")}
                          className="tooltip-share px-2 py-1.5 text-gh-text-muted hover:text-gh-blue border border-gh-border rounded-md transition-all duration-200 hover:border-gh-blue/40"
                        >
                          <ShareIcon />
                        </button>
                      )}
                      <button
                        onClick={() => isDemo ? startRealListing() : openOutbid(rank, l)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-gh-green/90 border border-gh-green-bright/30 text-white hover:bg-gh-green-bright transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] claim-pulse tabular-nums"
                      >
                        {isDemo ? "Outbid them" : `Claim ${fmtDollars(nextAvailablePrice(l.boost + 100))}`}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Leaderboard */}
      {(() => {
        const renderRow = (l: Listing, rank: number) => {
          const claimLabel = isDemo ? "Outbid them" : `Claim ${fmtDollars(nextAvailablePrice(l.boost + 100))}`;
          return (
            <div
              key={l.id}
              id={!isDemo ? `listing-${l.id}` : undefined}
              className="listing-target scroll-mt-20 group border-b border-gh-border transition-all duration-200 hover:bg-gh-overlay/40"
            >
              {/* Desktop row */}
              <div className="hidden sm:flex items-center gap-4 px-4 py-3">
                <span className={`shrink-0 w-8 font-mono text-sm font-bold tabular-nums ${
                  rank <= 3 ? "text-gh-orange" : rank <= 10 ? "text-gh-text" : "text-gh-text-muted"
                }`}>
                  #{rank}
                </span>
                <button onClick={() => openProfile(l)} className="flex items-center gap-3 min-w-0 shrink-0 w-44">
                  <img src={l.avatar} alt="" className={`w-10 h-10 shrink-0 border-2 border-gh-border hover:border-gh-blue transition-all duration-200 hover:scale-105 ${l.type === "repo" ? "rounded-lg" : "rounded-full"}`} />
                  <div className="min-w-0">
                    <span className="font-bold text-gh-blue truncate block hover:underline text-sm transition-colors duration-150">{l.name}</span>
                    <span className="text-[11px] text-gh-text-muted truncate block">{l.type === "repo" ? l.github : `@${l.github}`}</span>
                  </div>
                </button>
                <div className="hidden md:flex items-center gap-3 shrink-0 text-xs text-gh-text-secondary">
                  {l.stars > 0 && (
                    <span className="flex items-center gap-1 tabular-nums">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="text-gh-yellow"><path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/></svg>
                      {fmt(l.stars)}
                    </span>
                  )}
                  {l.forks > 0 && (
                    <span className="flex items-center gap-1 tabular-nums">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="text-gh-text-muted"><path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"/></svg>
                      {fmt(l.forks)}
                    </span>
                  )}
                  {l.followers > 0 && (
                    <span className="flex items-center gap-1 tabular-nums">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="text-gh-text-muted"><path d="M2 5.5a3.5 3.5 0 115.898 2.549 5.508 5.508 0 013.034 4.084.75.75 0 11-1.482.235 4.001 4.001 0 00-7.9 0 .75.75 0 01-1.482-.236A5.507 5.507 0 013.102 8.05 3.493 3.493 0 012 5.5zM11 4a.75.75 0 100 1.5 1.5 1.5 0 01.666 2.844.75.75 0 00-.416.672v.352a.75.75 0 00.574.73c1.2.289 2.162 1.2 2.522 2.372a.75.75 0 101.434-.44 5.01 5.01 0 00-2.56-3.012A3 3 0 0011 4z"/></svg>
                      {fmt(l.followers)}
                    </span>
                  )}
                  {l.repos > 0 && l.type === "user" && (
                    <span className="flex items-center gap-1 tabular-nums">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="text-gh-text-muted"><path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1h-8a1 1 0 00-1 1v6.708A2.486 2.486 0 014.5 9h8V1.5z"/></svg>
                      {fmt(l.repos)}
                    </span>
                  )}
                  {l.language && (
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-gh-green-bright" />
                      {l.language}
                    </span>
                  )}
                </div>
                <div className="hidden lg:flex items-center flex-1 min-w-0 justify-center overflow-hidden px-2">
                  {l.type === "user" ? (
                    <ContribGrid username={l.github} />
                  ) : l.bio ? (
                    <span className="text-xs text-gh-text-muted italic truncate block w-full text-center">{l.bio}</span>
                  ) : null}
                </div>
                <div className="shrink-0 ml-auto pl-2 relative">
                  <div className="flex items-center justify-end gap-3 md:group-hover:opacity-0 transition-opacity duration-200">
                    <span className="text-[11px] text-gh-text-muted tabular-nums whitespace-nowrap">{isDemo ? "Example bid" : `${l.clicks} clicks`}</span>
                    <span className={`font-mono font-bold text-sm tabular-nums whitespace-nowrap text-right w-20 ${
                      rank <= 3 ? "text-gh-yellow" : "text-gh-green-bright"
                    }`}>
                      {fmtDollars(l.boost)}
                    </span>
                  </div>
                  <div className="hidden md:flex items-center gap-2 absolute inset-0 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {!isDemo && (
                      <button onClick={() => window.open(`/share?id=${l.id}`, "_blank")} className="tooltip-share px-1.5 py-1 text-gh-text-muted hover:text-gh-blue transition-all duration-200">
                        <ShareIcon />
                      </button>
                    )}
                    <button onClick={() => isDemo ? startRealListing() : openOutbid(rank, l)} className="px-3 py-1.5 text-xs font-semibold rounded-md border transition-all duration-200 bg-gh-green/90 border-gh-green-bright/30 text-white hover:bg-gh-green-bright hover:scale-[1.03] active:scale-[0.97] tabular-nums whitespace-nowrap">
                      {claimLabel}
                    </button>
                  </div>
                </div>
              </div>
              {/* Mobile row */}
              <div className="flex sm:hidden items-center gap-3 px-3 py-3">
                <span className={`shrink-0 w-7 font-mono text-xs font-bold tabular-nums ${
                  rank <= 3 ? "text-gh-orange" : rank <= 10 ? "text-gh-text" : "text-gh-text-muted"
                }`}>
                  #{rank}
                </span>
                <button onClick={() => openProfile(l)} className="flex items-center gap-2.5 min-w-0 flex-1">
                  <img src={l.avatar} alt="" className={`w-9 h-9 shrink-0 border-2 border-gh-border ${l.type === "repo" ? "rounded-lg" : "rounded-full"}`} />
                  <div className="min-w-0">
                    <span className="font-bold text-gh-blue truncate block text-sm">{l.name}</span>
                    <span className="text-[10px] text-gh-text-muted truncate block">
                      {l.stars > 0 && `${fmt(l.stars)} stars`}
                      {l.stars > 0 && l.language ? " · " : ""}
                      {l.language || ""}
                    </span>
                  </div>
                </button>
                <div className="shrink-0 flex items-center gap-2">
                  <span className={`font-mono font-bold text-sm tabular-nums ${
                    rank <= 3 ? "text-gh-yellow" : "text-gh-green-bright"
                  }`}>
                    {fmtDollars(l.boost)}
                  </span>
                  <button onClick={() => isDemo ? startRealListing() : openOutbid(rank, l)} className="px-2.5 py-1.5 text-[11px] font-semibold rounded-md bg-gh-green/90 border border-gh-green-bright/30 text-white tabular-nums">
                    {isDemo ? "Outbid" : "Claim"}
                  </button>
                </div>
              </div>
            </div>
          );
        };

        return (
          <div id="leaderboard" className="bg-gh-surface border border-gh-border rounded-md overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gh-border bg-gh-overlay/50">
              <h3 className="text-sm font-semibold text-gh-text">{isDemo ? "Example rankings" : "Live rankings"}</h3>
              <span className="text-xs text-gh-text-secondary tabular-nums">
                {isDemo ? `${displayedListings.length} examples` : displayedListings.length === 0 ? "No listings yet" : `${displayedListings.length} listed`}
              </span>
            </div>

            {loading ? (
              <div className="p-4 space-y-0">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 bg-gh-overlay/30 animate-pulse border-b border-gh-border last:border-b-0" />
                ))}
              </div>
            ) : displayedListings.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-gh-green/10 border border-gh-green-bright/25 text-gh-green-bright font-mono font-bold text-sm mb-3">#1</div>
                <p className="text-gh-text font-semibold text-sm">The live board is wide open.</p>
                <p className="text-gh-text-secondary text-sm mt-1.5 max-w-sm mx-auto leading-relaxed">
                  Think your profile or repo can beat the examples? Take the first real spot for <strong className="text-gh-text font-semibold">$0.50</strong>.
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 mt-4 max-w-xs mx-auto">
                  <button
                    type="button"
                    onClick={startRealListing}
                    className="px-4 py-2 rounded-md bg-gh-green text-white text-xs font-semibold border border-gh-green-bright/25 hover:bg-gh-green-bright transition-colors"
                  >
                    Claim live #1
                  </button>
                  <button
                    type="button"
                    onClick={() => changeBoardMode("demo")}
                    className="px-4 py-2 rounded-md bg-gh-overlay text-gh-text-secondary text-xs font-semibold border border-gh-border hover:text-gh-text hover:border-gh-blue/40 transition-colors"
                  >
                    See demo rankings
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Top 10: ranks 4-10 */}
                {tier4to10.length > 0 && (
                  <>
                    <TierHeader label="Top 10" count={tier4to10.length} demo={isDemo} />
                    {tier4to10.map((l, i) => renderRow(l, i + 4))}
                  </>
                )}

                {/* Top 20: ranks 11-20 */}
                {tier11to20.length > 0 && (
                  <>
                    <TierHeader label="Top 20" count={tier11to20.length} demo={isDemo} />
                    {tier11to20.map((l, i) => renderRow(l, i + 11))}
                  </>
                )}

                {/* Top 50: ranks 21-50 */}
                {tier21to50.length > 0 && (
                  <>
                    <TierHeader label="Top 50" count={tier21to50.length} demo={isDemo} />
                    {tier21to50.map((l, i) => renderRow(l, i + 21))}
                  </>
                )}

                {/* 51+: paginated */}
                {pagedRest.length > 0 && (
                  <>
                    <TierHeader label={`#${51 + (page - 1) * ITEMS_PER_PAGE}+`} count={pagedRest.length} demo={isDemo} />
                    {pagedRest.map((l, i) => renderRow(l, 51 + (page - 1) * ITEMS_PER_PAGE + i))}
                  </>
                )}

                {/* Pagination controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 px-4 py-3 border-t border-gh-border bg-gh-overlay/30">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 text-xs font-medium rounded-md border border-gh-border text-gh-text-secondary hover:text-gh-text hover:border-gh-text-muted transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-gh-text-muted tabular-nums">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1.5 text-xs font-medium rounded-md border border-gh-border text-gh-text-secondary hover:text-gh-text hover:border-gh-text-muted transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* Claim Spot Modal */}
      {outbidTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in-up" style={{ animationDuration: "0.15s" }} onClick={() => setOutbidTarget(null)} />
          <div className="relative w-full max-w-sm bg-gh-surface border border-gh-border rounded-lg p-5 shadow-2xl animate-fade-in-up" style={{ animationDuration: "0.2s" }}>
            <button onClick={() => setOutbidTarget(null)} className="absolute top-3 right-3 text-gh-text-muted hover:text-gh-text text-lg leading-none transition-colors duration-150">&times;</button>

            <h2 className="text-base font-semibold text-gh-text mb-1">
              Claim spot #{outbidTarget.rank}
            </h2>
            <p className="text-xs text-gh-text-secondary mb-1">
              <strong className="text-gh-text">{outbidTarget.listing.name}</strong> is here at <strong className="text-gh-text">{fmtDollars(outbidTarget.listing.boost)}</strong>
            </p>
            <p className="text-xs text-gh-green-bright font-medium mb-4">
              Pay <strong>{fmtDollars(nextAvailablePrice(outbidTarget.listing.boost + 100))}</strong> to take this spot, or bid less to land lower
            </p>

            {outbidStep === "github" ? (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Your GitHub username or repo"
                  value={outbidInput}
                  onChange={(e) => setOutbidInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && outbidLookup()}
                  autoFocus
                  className="w-full px-3 py-2 bg-gh-canvas border border-gh-border rounded-md text-sm text-gh-text placeholder-gh-text-muted focus:outline-none focus:border-gh-blue focus:ring-1 focus:ring-gh-blue/30 transition-all duration-200"
                />
                {outbidError && <p className="text-gh-red text-xs animate-fade-in-up">{outbidError}</p>}
                <button
                  onClick={outbidLookup}
                  disabled={outbidLooking || !outbidInput.trim()}
                  className="w-full py-2 rounded-md bg-gh-green text-white font-semibold text-sm hover:bg-gh-green-bright transition-all duration-200 disabled:opacity-40 border border-gh-green-bright/20 hover:scale-[1.01] active:scale-[0.99]"
                >
                  {outbidLooking ? "Looking up..." : "Next"}
                </button>
              </div>
            ) : outbidData ? (
              <div className="space-y-4 animate-fade-in-up">
                <div className="flex items-center gap-3 p-3 bg-gh-overlay rounded-md border border-gh-border">
                  <img src={outbidData.avatar} alt="" className="w-9 h-9 rounded-full border border-gh-border" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gh-text truncate">{outbidData.name}</p>
                    <p className="text-[11px] text-gh-text-muted">
                      {outbidData.stars > 0 && `${fmt(outbidData.stars)} stars`}
                      {outbidData.followers > 0 && ` · ${fmt(outbidData.followers)} followers`}
                    </p>
                  </div>
                  <button onClick={() => { setOutbidStep("github"); setOutbidData(null); }} className="text-xs text-gh-blue hover:underline ml-auto shrink-0 transition-colors duration-150">change</button>
                </div>

                <div>
                  <label className="block text-xs text-gh-text-secondary mb-1.5">Your bid</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gh-text-muted text-sm font-mono">$</span>
                    <input
                      type="number"
                      min="0.50"
                      step="0.50"
                      value={outbidBid}
                      onChange={(e) => setOutbidBid(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 bg-gh-canvas border border-gh-border rounded-md text-gh-text font-mono text-sm focus:outline-none focus:border-gh-blue focus:ring-1 focus:ring-gh-blue/30 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Dynamic rank prediction */}
                <div className="px-3 py-2 bg-gh-overlay rounded-md border border-gh-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gh-text-secondary">
                      {outbidCents >= 50 ? "You'll land at" : "Enter a bid"}
                    </span>
                    {outbidCents >= 50 && (
                      <span className={`font-mono font-bold text-sm tabular-nums ${outbidRankColor}`}>
                        #{outbidPredictedRank}
                        <span className="text-gh-text-muted font-normal text-xs ml-1">
                          of {listings.length + 1}
                        </span>
                      </span>
                    )}
                  </div>
                  {outbidSameBidCount > 0 && outbidCents >= 50 && (
                    <p className="text-[11px] text-gh-yellow mt-1">
                      {fmtDollars(outbidCents)} is taken — try <span className="text-gh-green-bright font-medium">{fmtDollars(outbidCents + 100)}</span>
                    </p>
                  )}
                </div>

                {outbidError && <p className="text-gh-red text-xs animate-fade-in-up">{outbidError}</p>}

                <button
                  onClick={outbidSubmit}
                  disabled={outbidSubmitting}
                  className="w-full py-2 rounded-md bg-gh-green text-white font-semibold text-sm hover:bg-gh-green-bright transition-all duration-200 disabled:opacity-40 border border-gh-green-bright/20 hover:scale-[1.01] active:scale-[0.99]"
                >
                  {outbidSubmitting ? "Processing..." : `Pay ${fmtDollars(outbidCents)} & claim #${outbidPredictedRank}`}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
