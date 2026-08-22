import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

if (typeof globalThis.WebSocket === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

const demoListings = [
  // === Top 3 (Featured Cards) ===
  { type: "user", github: "torvalds", name: "Linus Torvalds", avatar: "https://avatars.githubusercontent.com/u/1024025", stars: 185000, forks: 0, followers: 230000, repos: 7, language: null, bio: "Creator of Linux and Git. Just a hobby, won't be big and professional.", url: "https://github.com/torvalds", boost: 25000, clicks: 1842, active: true },
  { type: "user", github: "gaearon", name: "Dan Abramov", avatar: "https://avatars.githubusercontent.com/u/810438", stars: 340000, forks: 0, followers: 82000, repos: 260, language: null, bio: "Working on React at Meta. Created Redux and Create React App.", url: "https://github.com/gaearon", boost: 18000, clicks: 1205, active: true },
  { type: "repo", github: "facebook/react", name: "react", avatar: "https://avatars.githubusercontent.com/u/69631", stars: 232000, forks: 47400, followers: 0, repos: 0, language: "JavaScript", bio: "The library for web and native user interfaces.", url: "https://github.com/facebook/react", boost: 15000, clicks: 978, active: true },

  // === Top 10 (ranks 4-10) ===
  { type: "user", github: "sindresorhus", name: "Sindre Sorhus", avatar: "https://avatars.githubusercontent.com/u/170270", stars: 502000, forks: 0, followers: 56000, repos: 1100, language: null, bio: "Full-Time Open-Sourcerer. Maker of many npm packages and apps.", url: "https://github.com/sindresorhus", boost: 12000, clicks: 342, active: true },
  { type: "repo", github: "vercel/next.js", name: "next.js", avatar: "https://avatars.githubusercontent.com/u/14985020", stars: 128000, forks: 27000, followers: 0, repos: 0, language: "TypeScript", bio: "The React Framework for the Web", url: "https://github.com/vercel/next.js", boost: 10000, clicks: 218, active: true },
  { type: "user", github: "tj", name: "TJ Holowaychuk", avatar: "https://avatars.githubusercontent.com/u/25254", stars: 290000, forks: 0, followers: 34000, repos: 280, language: null, bio: "Creator of Express, Koa, Commander, and many more.", url: "https://github.com/tj", boost: 8500, clicks: 156, active: true },
  { type: "repo", github: "denoland/deno", name: "deno", avatar: "https://avatars.githubusercontent.com/u/42048915", stars: 101000, forks: 5400, followers: 0, repos: 0, language: "Rust", bio: "A modern runtime for JavaScript and TypeScript.", url: "https://github.com/denoland/deno", boost: 7000, clicks: 89, active: true },
  { type: "user", github: "antfu", name: "Anthony Fu", avatar: "https://avatars.githubusercontent.com/u/11247099", stars: 180000, forks: 0, followers: 22000, repos: 420, language: null, bio: "A fanatical open sourcerer. Core team of Vue, Nuxt, Vite.", url: "https://github.com/antfu", boost: 5500, clicks: 67, active: true },
  { type: "repo", github: "tailwindlabs/tailwindcss", name: "tailwindcss", avatar: "https://avatars.githubusercontent.com/u/67109815", stars: 86000, forks: 4300, followers: 0, repos: 0, language: "TypeScript", bio: "A utility-first CSS framework for rapid UI development.", url: "https://github.com/tailwindlabs/tailwindcss", boost: 4500, clicks: 45, active: true },
  { type: "user", github: "ThePrimeagen", name: "ThePrimeagen", avatar: "https://avatars.githubusercontent.com/u/4458174", stars: 12000, forks: 0, followers: 15000, repos: 90, language: null, bio: "Netflix engineer. Vim btw.", url: "https://github.com/ThePrimeagen", boost: 3800, clicks: 34, active: true },

  // === Top 20 (ranks 11-20) ===
  { type: "repo", github: "vuejs/vue", name: "vue", avatar: "https://avatars.githubusercontent.com/u/6128107", stars: 208000, forks: 33800, followers: 0, repos: 0, language: "TypeScript", bio: "The progressive JavaScript framework.", url: "https://github.com/vuejs/vue", boost: 3300, clicks: 312, active: true },
  { type: "user", github: "yyx990803", name: "Evan You", avatar: "https://avatars.githubusercontent.com/u/499550", stars: 420000, forks: 0, followers: 95000, repos: 180, language: null, bio: "Creator of Vue.js and Vite.", url: "https://github.com/yyx990803", boost: 2900, clicks: 287, active: true },
  { type: "repo", github: "microsoft/TypeScript", name: "TypeScript", avatar: "https://avatars.githubusercontent.com/u/6154722", stars: 102000, forks: 12500, followers: 0, repos: 0, language: "TypeScript", bio: "TypeScript is a superset of JavaScript that compiles to clean JavaScript output.", url: "https://github.com/microsoft/TypeScript", boost: 2600, clicks: 198, active: true },
  { type: "user", github: "rauchg", name: "Guillermo Rauch", avatar: "https://avatars.githubusercontent.com/u/13041", stars: 45000, forks: 0, followers: 28000, repos: 120, language: null, bio: "CEO at Vercel. Creator of Socket.IO and Mongoose.", url: "https://github.com/rauchg", boost: 2300, clicks: 176, active: true },
  { type: "repo", github: "golang/go", name: "go", avatar: "https://avatars.githubusercontent.com/u/4314092", stars: 125000, forks: 17800, followers: 0, repos: 0, language: "Go", bio: "The Go programming language.", url: "https://github.com/golang/go", boost: 2100, clicks: 165, active: true },
  { type: "user", github: "mitsuhiko", name: "Armin Ronacher", avatar: "https://avatars.githubusercontent.com/u/7396", stars: 150000, forks: 0, followers: 18000, repos: 340, language: null, bio: "Creator of Flask, Jinja, and Sentry.", url: "https://github.com/mitsuhiko", boost: 1900, clicks: 143, active: true },
  { type: "repo", github: "rust-lang/rust", name: "rust", avatar: "https://avatars.githubusercontent.com/u/5430905", stars: 100000, forks: 13000, followers: 0, repos: 0, language: "Rust", bio: "Empowering everyone to build reliable and efficient software.", url: "https://github.com/rust-lang/rust", boost: 1700, clicks: 134, active: true },
  { type: "user", github: "kentcdodds", name: "Kent C. Dodds", avatar: "https://avatars.githubusercontent.com/u/1500684", stars: 95000, forks: 0, followers: 32000, repos: 450, language: null, bio: "Improving the world with quality software.", url: "https://github.com/kentcdodds", boost: 1500, clicks: 112, active: true },
  { type: "repo", github: "sveltejs/svelte", name: "svelte", avatar: "https://avatars.githubusercontent.com/u/23617963", stars: 81000, forks: 4300, followers: 0, repos: 0, language: "JavaScript", bio: "Cybernetically enhanced web apps.", url: "https://github.com/sveltejs/svelte", boost: 1300, clicks: 98, active: true },
  { type: "user", github: "Rich-Harris", name: "Rich Harris", avatar: "https://avatars.githubusercontent.com/u/1162160", stars: 120000, forks: 0, followers: 14000, repos: 200, language: null, bio: "Creator of Svelte. Works at Vercel.", url: "https://github.com/Rich-Harris", boost: 1100, clicks: 87, active: true },

  // === Top 50 (ranks 21-30) ===
  { type: "repo", github: "microsoft/vscode", name: "vscode", avatar: "https://avatars.githubusercontent.com/u/6154722", stars: 166000, forks: 30000, followers: 0, repos: 0, language: "TypeScript", bio: "Visual Studio Code — code editing redefined.", url: "https://github.com/microsoft/vscode", boost: 950, clicks: 76, active: true },
  { type: "user", github: "wycats", name: "Yehuda Katz", avatar: "https://avatars.githubusercontent.com/u/4", stars: 65000, forks: 0, followers: 10000, repos: 310, language: null, bio: "Co-creator of Ember.js and Rust core team.", url: "https://github.com/wycats", boost: 850, clicks: 65, active: true },
  { type: "repo", github: "django/django", name: "django", avatar: "https://avatars.githubusercontent.com/u/27804", stars: 82000, forks: 32000, followers: 0, repos: 0, language: "Python", bio: "The web framework for perfectionists with deadlines.", url: "https://github.com/django/django", boost: 750, clicks: 58, active: true },
  { type: "user", github: "getify", name: "Kyle Simpson", avatar: "https://avatars.githubusercontent.com/u/150330", stars: 180000, forks: 0, followers: 45000, repos: 130, language: null, bio: "Author of You Don't Know JS. Open Web Evangelist.", url: "https://github.com/getify", boost: 650, clicks: 49, active: true },
  { type: "repo", github: "pallets/flask", name: "flask", avatar: "https://avatars.githubusercontent.com/u/16748505", stars: 69000, forks: 16200, followers: 0, repos: 0, language: "Python", bio: "The Python micro framework for building web applications.", url: "https://github.com/pallets/flask", boost: 550, clicks: 42, active: true },
  { type: "user", github: "substack", name: "James Halliday", avatar: "https://avatars.githubusercontent.com/u/12631", stars: 110000, forks: 0, followers: 12000, repos: 900, language: null, bio: "Prolific open source hacker. Author of browserify.", url: "https://github.com/substack", boost: 450, clicks: 38, active: true },
  { type: "repo", github: "docker/compose", name: "docker-compose", avatar: "https://avatars.githubusercontent.com/u/5429470", stars: 34000, forks: 5200, followers: 0, repos: 0, language: "Go", bio: "Define and run multi-container applications with Docker.", url: "https://github.com/docker/compose", boost: 350, clicks: 31, active: true },
  { type: "user", github: "addyosmani", name: "Addy Osmani", avatar: "https://avatars.githubusercontent.com/u/110953", stars: 78000, forks: 0, followers: 42000, repos: 260, language: null, bio: "Engineering Manager at Google Chrome. Web performance advocate.", url: "https://github.com/addyosmani", boost: 250, clicks: 27, active: true },
  { type: "repo", github: "expressjs/express", name: "express", avatar: "https://avatars.githubusercontent.com/u/5658226", stars: 65000, forks: 16000, followers: 0, repos: 0, language: "JavaScript", bio: "Fast, unopinionated, minimalist web framework for Node.js.", url: "https://github.com/expressjs/express", boost: 150, clicks: 22, active: true },
  { type: "user", github: "developit", name: "Jason Miller", avatar: "https://avatars.githubusercontent.com/u/105127", stars: 55000, forks: 0, followers: 9500, repos: 200, language: null, bio: "Creator of Preact. Staff engineer at Google.", url: "https://github.com/developit", boost: 50, clicks: 18, active: true },
];

async function seed() {
  const existingListings = await prisma.listing.count();

  if (existingListings > 0) {
    throw new Error("Refusing to seed a database that already has listings.");
  }

  await prisma.siteStats.upsert({
    where: { id: "global" },
    update: { totalViews: 8432 },
    create: { id: "global", totalViews: 8432 },
  });

  for (const listing of demoListings) {
    await prisma.listing.create({ data: listing });
  }

  console.log(`Seeded ${demoListings.length} demo listings`);
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
