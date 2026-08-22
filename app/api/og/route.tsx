import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const name = searchParams.get("name") || "Developer";
  const rank = searchParams.get("rank") || "?";
  const stars = searchParams.get("stars") || "0";
  const avatar = searchParams.get("avatar") || "";
  const language = searchParams.get("language") || "";
  const followers = searchParams.get("followers") || "0";
  const bid = searchParams.get("bid") || "0";
  const type = searchParams.get("type") || "user";

  const rankNum = parseInt(rank);
  const rankColor = rankNum === 1 ? "#e3b341" : rankNum === 2 ? "#8b949e" : rankNum === 3 ? "#d29922" : "#3fb950";
  const bidDollars = `$${Math.round(parseInt(bid) / 100).toLocaleString()}`;

  const statParts: string[] = [];
  if (parseInt(stars) > 0) statParts.push(`★ ${parseInt(stars).toLocaleString()}`);
  if (parseInt(followers) > 0) statParts.push(`${parseInt(followers).toLocaleString()} followers`);
  if (language) statParts.push(language);

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
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: "-200px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "800px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${rankColor}08 0%, transparent 70%)`,
            display: "flex",
          }}
        />

        {/* Top border accent */}
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            height: "4px",
            background: `linear-gradient(90deg, transparent, ${rankColor}, transparent)`,
            display: "flex",
          }}
        />

        {/* Header: GitFlex logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "32px 48px 0",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "#2ea04320",
              border: "1px solid #2ea04340",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 16 16" fill="#2ea043">
              <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
            </svg>
          </div>
          <span style={{ color: "#e6edf3", fontSize: "22px", fontWeight: "700", letterSpacing: "-0.5px" }}>
            GitFlex
          </span>
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flex: "1",
            alignItems: "center",
            padding: "0 48px",
            gap: "48px",
          }}
        >
          {/* Left: Avatar with rank badge */}
          <div style={{ display: "flex", position: "relative", flexShrink: "0" }}>
            {avatar ? (
              <img
                src={avatar}
                alt=""
                width="180"
                height="180"
                style={{
                  borderRadius: type === "repo" ? "24px" : "50%",
                  border: `4px solid ${rankColor}60`,
                  boxShadow: `0 0 60px ${rankColor}20`,
                }}
              />
            ) : (
              <div
                style={{
                  width: "180px",
                  height: "180px",
                  borderRadius: "50%",
                  background: "#161b22",
                  border: `4px solid ${rankColor}60`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "64px",
                  color: "#8b949e",
                }}
              >
                ?
              </div>
            )}
            {/* Rank badge overlay */}
            <div
              style={{
                position: "absolute",
                bottom: "-8px",
                right: "-8px",
                width: "72px",
                height: "72px",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                fontWeight: "900",
                background: "#0d1117",
                color: rankColor,
                border: `3px solid ${rankColor}`,
                boxShadow: `0 0 20px ${rankColor}40`,
              }}
            >
              #{rank}
            </div>
          </div>

          {/* Right: Info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              flex: "1",
              minWidth: "0",
            }}
          >
            {/* Name */}
            <div style={{ fontSize: "56px", fontWeight: "800", color: "#e6edf3", letterSpacing: "-1px", display: "flex" }}>
              {name}
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", gap: "24px", fontSize: "22px", color: "#8b949e" }}>
              {statParts.map((stat, i) => (
                <span key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {stat}
                </span>
              ))}
            </div>

            {/* Bid + CTA row */}
            <div style={{ display: "flex", alignItems: "center", gap: "24px", marginTop: "8px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  background: "#2ea04318",
                  border: "2px solid #2ea04340",
                }}
              >
                <span style={{ fontSize: "32px", fontWeight: "800", color: "#3fb950" }}>
                  {bidDollars}
                </span>
                <span style={{ fontSize: "18px", color: "#8b949e" }}>
                  bid
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  background: `${rankColor}18`,
                  border: `2px solid ${rankColor}40`,
                }}
              >
                <span style={{ fontSize: "32px", fontWeight: "800", color: rankColor }}>
                  #{rank}
                </span>
                <span style={{ fontSize: "18px", color: "#8b949e" }}>
                  rank
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 48px 32px",
          }}
        >
          <div style={{ display: "flex", fontSize: "18px", color: "#484f58" }}>
            gitflex.lol
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 20px",
              borderRadius: "8px",
              background: "#2ea04320",
              border: "1px solid #2ea04340",
              fontSize: "16px",
              fontWeight: "700",
              color: "#3fb950",
            }}
          >
            Can you beat this? →
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
