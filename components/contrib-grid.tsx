"use client";

import { useEffect, useState } from "react";

type DayData = { date: string; count: number; level: number };
type ContributionData = { weeks: DayData[][]; total: number; streak: number };

const contributionCache = new Map<string, ContributionData>();

export function ContribGrid({ username }: { username: string }) {
  const cached = contributionCache.get(username);
  const [weeks, setWeeks] = useState<DayData[][]>(() => cached?.weeks ?? []);
  const [total, setTotal] = useState(() => cached?.total ?? 0);
  const [streak, setStreak] = useState(() => cached?.streak ?? 0);
  const [loading, setLoading] = useState(() => !cached);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (contributionCache.has(username)) return;

      try {
        const res = await fetch(`/api/contributions?username=${encodeURIComponent(username)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        contributionCache.set(username, data);
        setWeeks(data.weeks);
        setTotal(data.total);
        setStreak(data.streak);
      } catch {
        // silent fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [username]);

  if (loading || weeks.length === 0) return null;

  const recentWeeks = weeks.slice(-14);

  const levelClass = (level: number) => {
    switch (level) {
      case 0: return "contrib-0 bg-[#161b22]";
      case 1: return "contrib-1 bg-[#0e4429]";
      case 2: return "contrib-2 bg-[#006d32]";
      case 3: return "contrib-3 bg-[#26a641]";
      case 4: return "contrib-4 bg-[#39d353]";
      default: return "contrib-0 bg-[#161b22]";
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-[3px]">
        {recentWeeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) => (
              <div
                key={di}
                className={`w-[8px] h-[8px] rounded-[2px] ${levelClass(day.level)} transition-colors duration-300`}
                title={`${day.date}: ${day.count} contributions`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex flex-col text-[11px] whitespace-nowrap gap-0.5">
        <span className="font-bold text-gh-green-bright tabular-nums">{total.toLocaleString()} commits</span>
        {streak > 0 && (
          <span className="flex items-center gap-1 text-gh-orange font-semibold">
            <span className="animate-fire">🔥</span>
            <span className="tabular-nums">{streak}d streak</span>
          </span>
        )}
      </div>
    </div>
  );
}
