import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const name = searchParams.get("name") || "Developer";
  const rank = searchParams.get("rank") || "?";
  const stars = searchParams.get("stars") || "0";
  const avatar = searchParams.get("avatar") || "";
  const language = searchParams.get("language") || "";
  const followers = searchParams.get("followers") || "0";
  const bid = searchParams.get("bid") || "0";

  const rankColor = rank === "1" ? "#e3b341" : rank === "2" ? "#8b949e" : rank === "3" ? "#d29922" : "#484f58";
  const borderColor = rank === "1" ? "#e3b341" : rank === "2" ? "#8b949e" : rank === "3" ? "#d29922" : "#30363d";
  const badgeBg = rank === "1" ? "#e3b34122" : rank === "2" ? "#8b949e22" : rank === "3" ? "#d2992222" : "#30363d33";

  const statParts: string[] = [];
  if (parseInt(stars) > 0) statParts.push(`${parseInt(stars).toLocaleString()} stars`);
  if (parseInt(followers) > 0) statParts.push(`${parseInt(followers).toLocaleString()} followers`);
  if (language) statParts.push(language);
  const statsText = statParts.join("  ·  ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: "#0d1117",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          border: `3px solid ${borderColor}`,
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "56px",
            background: "#161b22",
            borderBottom: "1px solid #30363d",
            paddingLeft: "32px",
            gap: "12px",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 16 16" fill="#e6edf3">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          <span style={{ color: "#e6edf3", fontSize: "18px", fontWeight: "600" }}>
            GitFlex
          </span>
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flex: "1",
            alignItems: "center",
            justifyContent: "center",
            gap: "40px",
          }}
        >
          {/* Rank badge */}
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: "800",
              background: badgeBg,
              color: rankColor,
              border: `2px solid ${rankColor}44`,
            }}
          >
            #{rank}
          </div>

          {/* Avatar */}
          {avatar ? (
            <img
              src={avatar}
              alt=""
              width="100"
              height="100"
              style={{
                borderRadius: "50%",
                border: "3px solid #30363d",
              }}
            />
          ) : null}

          {/* Info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div style={{ fontSize: "40px", fontWeight: "700", color: "#e6edf3", display: "flex" }}>
              {name}
            </div>
            <div style={{ display: "flex", fontSize: "18px", color: "#8b949e" }}>
              {statsText}
            </div>
            <div style={{ fontSize: "22px", color: "#3fb950", fontWeight: "700", display: "flex" }}>
              Bid: ${(parseInt(bid) / 100).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingBottom: "24px",
            color: "#484f58",
            fontSize: "16px",
          }}
        >
          gitflex.dev — Flex your GitHub. Claim your rank.
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  ) as unknown as Response;
}
