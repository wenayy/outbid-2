"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const listingId = params.get("id");
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(!!listingId);

  useEffect(() => {
    if (!listingId) return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 15;

    const poll = async () => {
      try {
        const res = await fetch("/api/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId }),
        });
        const data = await res.json();
        if (data.active) {
          if (!cancelled) {
            setVerified(true);
            setChecking(false);
          }
          return;
        }
      } catch {}

      attempts++;
      if (attempts < maxAttempts && !cancelled) {
        setTimeout(poll, 2000);
      } else if (!cancelled) {
        setChecking(false);
      }
    };

    poll();
    return () => { cancelled = true; };
  }, [listingId]);

  return (
    <main className="flex-1 flex items-center justify-center bg-gh-canvas">
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 ${
          verified
            ? "bg-gh-green/10 border border-gh-green/30"
            : checking
            ? "bg-gh-blue/10 border border-gh-blue/30 animate-pulse"
            : "bg-gh-yellow/10 border border-gh-yellow/30"
        }`}>
          {verified ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3fb950" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : checking ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" style={{ animationDuration: "2s" }}>
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e3b341" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
        </div>

        <h1 className="text-2xl font-bold mb-2 text-gh-text">
          {verified
            ? "You're on the board!"
            : checking
            ? "Verifying payment..."
            : "Payment received"}
        </h1>
        <p className="text-gh-text-secondary text-sm mb-8">
          {verified
            ? "Your listing is live. Share it to get more clicks."
            : checking
            ? "Confirming your checkout with Polar. This usually takes a few seconds."
            : "We couldn't confirm your listing automatically. It may take a moment — check the leaderboard."}
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-md bg-gh-green text-white font-semibold text-sm hover:bg-gh-green-bright transition-colors border border-gh-green-bright/20"
          >
            View leaderboard
          </Link>
          <button
            onClick={() => {
              const text = "I'm flexing my GitHub on GitFlex — check where I rank";
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
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main className="flex-1 flex items-center justify-center bg-gh-canvas">
        <div className="text-gh-text-secondary text-sm">Loading...</div>
      </main>
    }>
      <SuccessContent />
    </Suspense>
  );
}
