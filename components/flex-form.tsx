"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type GitHubData = {
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

const BOOST_OPTIONS = [
  { label: "$5", value: 500 },
  { label: "$10", value: 1000 },
  { label: "$25", value: 2500 },
  { label: "$50", value: 5000 },
  { label: "$100", value: 10000 },
];

export function FlexForm() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [githubData, setGithubData] = useState<GitHubData | null>(null);
  const [boost, setBoost] = useState(1000);
  const [customBoost, setCustomBoost] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"input" | "preview">("input");

  const handleLookup = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/github?q=${encodeURIComponent(input.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Not found");
        return;
      }

      setGithubData(data);
      setStep("preview");
    } catch {
      setError("Failed to fetch. Check the username/repo.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!githubData) return;
    setSubmitting(true);
    setError("");

    const finalBoost = customBoost ? Math.round(parseFloat(customBoost) * 100) : boost;

    if (finalBoost < 500) {
      setError("Minimum boost is $5");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...githubData, boost: finalBoost }),
      });

      const data = await res.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        router.push(`/success?id=${data.listingId}`);
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "preview" && githubData) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        {/* Preview card */}
        <div className="bg-gh-surface border border-gh-border rounded-xl p-6 transition-colors duration-300">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={githubData.avatar}
              alt={githubData.name}
              className="w-14 h-14 rounded-full border border-gh-border"
            />
            <div>
              <h3 className="text-lg font-semibold text-gh-text">{githubData.name}</h3>
              <p className="text-sm text-gh-text-muted">
                {githubData.type === "repo" ? githubData.github : `@${githubData.github}`}
              </p>
            </div>
          </div>
          {githubData.bio && (
            <p className="text-sm text-gh-text-secondary mb-4">{githubData.bio}</p>
          )}
          <div className="flex gap-4 text-sm">
            {githubData.stars > 0 && (
              <span className="text-gh-text-secondary">
                <span className="font-mono font-semibold">{githubData.stars.toLocaleString()}</span>
                <span className="text-gh-text-muted ml-1">stars</span>
              </span>
            )}
            {githubData.followers > 0 && (
              <span className="text-gh-text-secondary">
                <span className="font-mono font-semibold">{githubData.followers.toLocaleString()}</span>
                <span className="text-gh-text-muted ml-1">followers</span>
              </span>
            )}
            {githubData.forks > 0 && (
              <span className="text-gh-text-secondary">
                <span className="font-mono font-semibold">{githubData.forks.toLocaleString()}</span>
                <span className="text-gh-text-muted ml-1">forks</span>
              </span>
            )}
          </div>
        </div>

        {/* Boost amount */}
        <div>
          <label className="block text-sm text-gh-text-secondary mb-3">
            Boost amount — higher boost = higher rank
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {BOOST_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setBoost(opt.value); setCustomBoost(""); }}
                className={`px-4 py-2 rounded-lg text-sm font-mono font-medium transition-all ${
                  boost === opt.value && !customBoost
                    ? "bg-gh-green/15 border border-gh-green-bright/40 text-gh-green-bright"
                    : "bg-gh-surface border border-gh-border text-gh-text-secondary hover:border-gh-text-muted"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gh-text-muted">$</span>
            <input
              type="number"
              min="5"
              step="1"
              placeholder="Or enter custom amount"
              value={customBoost}
              onChange={(e) => setCustomBoost(e.target.value)}
              className="w-full pl-7 pr-4 py-2.5 bg-gh-canvas border border-gh-border rounded-lg text-gh-text placeholder-gh-text-muted focus:outline-none focus:border-gh-blue font-mono text-sm transition-colors duration-200"
            />
          </div>
        </div>

        {error && (
          <p className="text-gh-red text-sm">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => { setStep("input"); setGithubData(null); }}
            className="px-4 py-2.5 rounded-lg border border-gh-border text-gh-text-secondary text-sm hover:border-gh-text-muted hover:text-gh-text transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-lg bg-gh-green text-white font-semibold text-sm hover:bg-gh-green-bright transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Processing..." : `Boost for $${customBoost || (boost / 100)}`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div>
        <label className="block text-sm text-gh-text-secondary mb-2">
          GitHub username or repository URL
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="username or owner/repo"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            className="flex-1 px-4 py-2.5 bg-gh-canvas border border-gh-border rounded-lg text-gh-text placeholder-gh-text-muted focus:outline-none focus:border-gh-blue text-sm transition-colors duration-200"
          />
          <button
            onClick={handleLookup}
            disabled={loading || !input.trim()}
            className="px-5 py-2.5 rounded-lg bg-gh-green text-white font-semibold text-sm hover:bg-gh-green-bright transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "..." : "Look up"}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-gh-red text-sm">{error}</p>
      )}
    </div>
  );
}
