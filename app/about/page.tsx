import Link from "next/link";
import { connection } from "next/server";
import { BrandLogo } from "@/components/brand-logo";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "About - GitFlex",
  description: "Learn about GitFlex, the live developer leaderboard.",
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

async function getAboutStats() {
  await connection();

  const [siteStats, revenue, highestBid] = await Promise.all([
    prisma.siteStats.findUnique({ where: { id: "global" } }),
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.listing.findFirst({
      where: { active: true },
      orderBy: [{ boost: "desc" }, { stars: "desc" }],
      select: { id: true, github: true, name: true, boost: true },
    }),
  ]);

  return {
    visitors: siteStats?.totalViews ?? 0,
    revenue: revenue._sum.amount ?? 0,
    highestBid,
  };
}

export default async function AboutPage() {
  const stats = await getAboutStats();
  const highestBidHref = stats.highestBid
    ? `/#listing-${stats.highestBid.id}`
    : "/#leaderboard";

  return (
    <main className="min-h-screen">
      <nav className="bg-gh-surface border-b border-gh-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" aria-label="GitFlex home">
            <BrandLogo />
          </Link>
          <div className="flex items-center gap-5 text-sm text-gh-text-secondary">
            <Link href="/#leaderboard" className="hover:text-gh-text transition-colors">Leaderboard</Link>
            <Link href="/rules" className="hover:text-gh-text transition-colors">Rules</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase text-gh-green-bright mb-2">Built in public</p>
          <h1 className="text-3xl font-bold text-gh-text">About GitFlex</h1>
          <p className="mt-3 text-[15px] text-gh-text-secondary leading-relaxed max-w-2xl">
            A transparent, pay-to-rank leaderboard for developers and open source projects.
            Every number below comes from the live board.
          </p>
        </div>

        <section aria-label="Live GitFlex statistics" className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <div className="min-h-32 bg-gh-surface border border-gh-border rounded-lg p-5 flex flex-col justify-between">
            <span className="w-2 h-2 rounded-full bg-gh-green-bright" aria-hidden="true" />
            <div>
              <p className="font-mono text-2xl font-bold text-gh-text tabular-nums">{formatNumber(stats.visitors)}</p>
              <p className="mt-1 text-sm font-medium text-gh-text-secondary">visitors</p>
            </div>
          </div>

          <div className="min-h-32 bg-gh-surface border border-gh-border rounded-lg p-5 flex flex-col justify-between">
            <span className="w-2 h-2 rounded-full bg-gh-orange" aria-hidden="true" />
            <div>
              <p className="font-mono text-2xl font-bold text-gh-text tabular-nums">{formatMoney(stats.revenue)}</p>
              <p className="mt-1 text-sm font-medium text-gh-text-secondary">revenue</p>
            </div>
          </div>

          <Link
            href={highestBidHref}
            className="group min-h-32 bg-gh-surface border border-gh-border rounded-lg p-5 flex flex-col justify-between hover:border-gh-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-blue transition-colors"
            aria-label={stats.highestBid ? `View ${stats.highestBid.name} on the live leaderboard` : "View the live leaderboard"}
          >
            <span className="flex items-center justify-between">
              <span className="w-2 h-2 rounded-full bg-gh-orange" aria-hidden="true" />
              <span className="text-gh-text-muted group-hover:text-gh-blue transition-colors" aria-hidden="true">&#8599;</span>
            </span>
            <div>
              <p className="font-mono text-2xl font-bold text-gh-text tabular-nums">
                {formatMoney(stats.highestBid?.boost ?? 0)}
              </p>
              <p className="mt-1 text-sm font-medium text-gh-text-secondary truncate">
                highest bid{stats.highestBid ? ` - ${stats.highestBid.github}` : " - no bids yet"}
              </p>
            </div>
          </Link>
        </section>

        <div className="space-y-5 text-[15px] text-gh-text-secondary leading-relaxed">
          <section className="bg-gh-surface border border-gh-border rounded-lg p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-gh-text mb-3">What is GitFlex?</h2>
            <p>
              GitFlex is a live leaderboard where developers pay to rank their GitHub profile or repository.
              Think of it as a billboard for developers: the more you bid, the higher you rank, and the more
              visibility you get from the developer community.
            </p>
          </section>

          <section className="bg-gh-surface border border-gh-border rounded-lg p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-gh-text mb-3">How does it work?</h2>
            <ol className="list-decimal pl-5 space-y-2.5 marker:text-gh-green-bright marker:font-semibold">
              <li><strong className="text-gh-text">Paste your GitHub</strong> - Enter your GitHub username or repository URL.</li>
              <li><strong className="text-gh-text">Set your bid</strong> - Start at $0.50 to get on the live board.</li>
              <li><strong className="text-gh-text">Claim your rank</strong> - Your position is determined by your bid amount.</li>
              <li><strong className="text-gh-text">Get traffic</strong> - Your listing links to GitHub and tracks real clicks.</li>
            </ol>
          </section>

          <section className="bg-gh-surface border border-gh-border rounded-lg p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-gh-text mb-3">Why GitFlex?</h2>
            <ul className="space-y-2.5">
              <li><strong className="text-gh-text">Zero friction</strong> - No signup or login. Just paste and pay.</li>
              <li><strong className="text-gh-text">Real metrics</strong> - We pull stars, forks, followers, repositories, and contribution history directly from GitHub.</li>
              <li><strong className="text-gh-text">Shareable cards</strong> - Every live listing gets a branded card you can share.</li>
              <li><strong className="text-gh-text">Competitive</strong> - Someone took your spot? Outbid them and climb the board.</li>
            </ul>
          </section>

          <section className="bg-gh-surface border border-gh-border rounded-lg p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-gh-text mb-3">Who is this for?</h2>
            <p>
              Open source maintainers, indie hackers, developer advocates, and anyone who wants to put their
              GitHub work in front of more developers. Whether you have 10 stars or 100k, GitFlex gives the work a stage.
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link href="/#leaderboard" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-gh-green text-white font-semibold text-sm hover:bg-gh-green-bright transition-colors border border-gh-green-bright/20">
            Back to Leaderboard
          </Link>
        </div>
      </div>
    </main>
  );
}
