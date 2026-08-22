"use client";

import { useEffect, useRef } from "react";

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const start = prev.current;
    const end = value;
    const duration = 800;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      if (el) el.textContent = `${prefix}${current.toLocaleString()}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
    prev.current = value;
  }, [value, prefix, suffix]);

  return <span ref={ref} className="tabular-nums">{prefix}{value.toLocaleString()}{suffix}</span>;
}

type StatsBarProps = {
  totalStars: number;
  totalListings: number;
  totalBoosted: number;
  totalViews: number;
};

export function StatsBar({ totalStars, totalListings, totalBoosted, totalViews }: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {[
        { label: "Total Stars", value: totalStars, prefix: "" },
        { label: "Devs Flexing", value: totalListings, prefix: "" },
        { label: "Total Boosted", value: totalBoosted / 100, prefix: "$" },
        { label: "Page Views", value: totalViews, prefix: "" },
      ].map((stat) => (
        <div
          key={stat.label}
          className="bg-gh-surface border border-gh-border rounded-xl p-4 md:p-5 transition-colors duration-300"
        >
          <p className="text-xs uppercase tracking-wider text-gh-text-muted mb-1">
            {stat.label}
          </p>
          <p className="text-2xl md:text-3xl font-semibold text-gh-text font-mono">
            <AnimatedNumber value={Math.round(stat.value)} prefix={stat.prefix} />
          </p>
        </div>
      ))}
    </div>
  );
}
