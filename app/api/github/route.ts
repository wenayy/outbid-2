import { NextRequest, NextResponse } from "next/server";
import { parseGitHubInput, fetchUser, fetchRepo } from "@/lib/github";

export async function GET(req: NextRequest) {
  const input = req.nextUrl.searchParams.get("q");
  if (!input) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  try {
    const parsed = parseGitHubInput(input);

    if (parsed.type === "repo" && parsed.repo) {
      const repo = await fetchRepo(parsed.owner, parsed.repo);
      return NextResponse.json({
        type: "repo",
        github: repo.full_name,
        name: repo.name,
        avatar: repo.owner.avatar_url,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        followers: 0,
        repos: 0,
        language: repo.language,
        bio: repo.description || repo.readme,
        url: repo.html_url,
      });
    }

    const user = await fetchUser(parsed.owner);
    // Prefer README over short bio since it's more descriptive
    const userBio = user.readme || user.bio;
    return NextResponse.json({
      type: "user",
      github: user.login,
      name: user.name || user.login,
      avatar: user.avatar_url,
      stars: user.total_stars,
      forks: 0,
      followers: user.followers,
      repos: user.public_repos,
      language: null,
      bio: userBio,
      url: user.html_url,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
