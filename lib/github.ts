const GITHUB_API = "https://api.github.com";

function headers() {
  const h: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };
  if (process.env.GITHUB_TOKEN) {
    h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return h;
}

export type GitHubUser = {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  readme: string | null;
  public_repos: number;
  followers: number;
  total_stars: number;
};

export type GitHubRepo = {
  full_name: string;
  owner: { login: string; avatar_url: string };
  html_url: string;
  name: string;
  description: string | null;
  readme: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  watchers_count: number;
};

async function fetchReadme(owner: string, repo: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/readme`,
      {
        headers: { ...headers(), Accept: "application/vnd.github.v3.raw" },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return null;
    const text = await res.text();
    // Strip markdown formatting, take first ~200 chars as a clean summary
    const cleaned = text
      .replace(/^#+\s.*$/gm, "") // remove headings
      .replace(/!\[.*?\]\(.*?\)/g, "") // remove images
      .replace(/\[([^\]]+)\]\(.*?\)/g, "$1") // links to text
      .replace(/[*_~`]/g, "") // remove formatting
      .replace(/<[^>]+>/g, "") // remove HTML tags
      .replace(/\n{2,}/g, "\n") // collapse newlines
      .trim();
    if (!cleaned) return null;
    return cleaned.length > 200 ? cleaned.slice(0, 200).trim() + "..." : cleaned;
  } catch {
    return null;
  }
}

export async function fetchUser(username: string): Promise<GitHubUser> {
  const res = await fetch(`${GITHUB_API}/users/${encodeURIComponent(username)}`, {
    headers: headers(),
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`GitHub user not found: ${username}`);
  const data = await res.json();

  // Fetch top repos to calculate total stars
  const reposRes = await fetch(
    `${GITHUB_API}/users/${encodeURIComponent(username)}/repos?sort=stars&per_page=100`,
    { headers: headers(), next: { revalidate: 300 } }
  );
  const repos = reposRes.ok ? await reposRes.json() : [];
  const total_stars = Array.isArray(repos)
    ? repos.reduce((sum: number, r: { stargazers_count: number }) => sum + r.stargazers_count, 0)
    : 0;

  // Fetch profile README (username/username repo)
  const readme = await fetchReadme(username, username);

  return {
    login: data.login,
    avatar_url: data.avatar_url,
    html_url: data.html_url,
    name: data.name,
    bio: data.bio,
    readme,
    public_repos: data.public_repos,
    followers: data.followers,
    total_stars,
  };
}

export async function fetchRepo(owner: string, repo: string): Promise<GitHubRepo> {
  const res = await fetch(
    `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    { headers: headers(), next: { revalidate: 300 } }
  );
  if (!res.ok) throw new Error(`GitHub repo not found: ${owner}/${repo}`);
  const data = await res.json();

  // Fetch repo README
  const readme = await fetchReadme(owner, repo);

  return {
    ...data,
    readme,
  };
}

export function parseGitHubInput(input: string): { type: "user" | "repo"; owner: string; repo?: string } {
  const cleaned = input.trim().replace(/^https?:\/\/(www\.)?github\.com\//, "").replace(/\/$/, "").replace(/^@/, "");
  const parts = cleaned.split("/").filter(Boolean);
  const owner = parts[0];
  const repo = parts[1];

  if (!owner || !/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(owner)) {
    throw new Error("Enter a valid GitHub username or repository.");
  }

  if (repo) {
    if (!/^[A-Za-z0-9._-]{1,100}$/.test(repo)) {
      throw new Error("Enter a valid GitHub repository.");
    }
    return { type: "repo", owner, repo };
  }

  return { type: "user", owner };
}
