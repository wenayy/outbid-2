import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const VISITOR_COOKIE = "outbid_visitor";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function POST(request: NextRequest) {
  if (request.cookies.has(VISITOR_COOKIE)) {
    return NextResponse.json({ counted: false });
  }

  await prisma.siteStats.upsert({
    where: { id: "global" },
    update: { totalViews: { increment: 1 } },
    create: { id: "global", totalViews: 1 },
  });

  const response = NextResponse.json({ counted: true });
  response.cookies.set(VISITOR_COOKIE, "1", {
    httpOnly: true,
    maxAge: THIRTY_DAYS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
