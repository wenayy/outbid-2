import { NextRequest, NextResponse } from "next/server";

type ContribDay = { date: string; count: number; level: number };

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username");
  if (!username) {
    return NextResponse.json({ error: "Missing username" }, { status: 400 });
  }

  try {
    // Free public API — no token needed
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`,
      { next: { revalidate: 3600 } } // cache 1 hour
    );

    if (!res.ok) {
      return NextResponse.json({ weeks: [], total: 0, streak: 0 });
    }

    const data = await res.json();

    // Parse into weeks of 7 days
    const contributions: ContribDay[] = data.contributions || [];
    const weeks: ContribDay[][] = [];
    let currentWeek: ContribDay[] = [];

    for (const day of contributions) {
      currentWeek.push({
        date: day.date,
        count: day.count,
        level: day.level,
      });
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) weeks.push(currentWeek);

    // Calculate total and streak
    const total = data.total?.lastYear || contributions.reduce((s: number, d: ContribDay) => s + d.count, 0);

    // Calculate current streak
    let streak = 0;
    for (let i = contributions.length - 1; i >= 0; i--) {
      // Skip today if no contributions yet (day isn't over)
      if (i === contributions.length - 1 && contributions[i].count === 0) continue;
      if (contributions[i].count > 0) {
        streak++;
      } else {
        break;
      }
    }

    return NextResponse.json({ weeks, total, streak });
  } catch {
    return NextResponse.json({ weeks: [], total: 0, streak: 0 });
  }
}
