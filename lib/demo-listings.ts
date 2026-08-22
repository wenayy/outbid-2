export type DemoListing = {
  id: string;
  type: string;
  github: string;
  name: string;
  avatar: string;
  stars: number;
  forks: number;
  followers: number;
  repos: number;
  language: string | null;
  bio: string | null;
  url: string;
  boost: number;
  clicks: number;
  createdAt: string;
};

const examples = [
  { type: "user", github: "torvalds", name: "Linus Torvalds", avatar: "https://avatars.githubusercontent.com/u/1024025", stars: 185000, forks: 0, followers: 230000, repos: 7, language: null, bio: "Creator of Linux and Git. Just a hobby, won't be big and professional.", url: "https://github.com/torvalds", boost: 25000, clicks: 1842 },
  { type: "user", github: "gaearon", name: "Dan Abramov", avatar: "https://avatars.githubusercontent.com/u/810438", stars: 340000, forks: 0, followers: 82000, repos: 260, language: null, bio: "Working on React. Created Redux and Create React App.", url: "https://github.com/gaearon", boost: 18000, clicks: 1205 },
  { type: "repo", github: "facebook/react", name: "react", avatar: "https://avatars.githubusercontent.com/u/69631", stars: 232000, forks: 47400, followers: 0, repos: 0, language: "JavaScript", bio: "The library for web and native user interfaces.", url: "https://github.com/facebook/react", boost: 15000, clicks: 978 },
  { type: "user", github: "sindresorhus", name: "Sindre Sorhus", avatar: "https://avatars.githubusercontent.com/u/170270", stars: 502000, forks: 0, followers: 56000, repos: 1100, language: null, bio: "Full-time open sourcerer. Maker of many npm packages and apps.", url: "https://github.com/sindresorhus", boost: 12000, clicks: 342 },
  { type: "repo", github: "vercel/next.js", name: "next.js", avatar: "https://avatars.githubusercontent.com/u/14985020", stars: 128000, forks: 27000, followers: 0, repos: 0, language: "TypeScript", bio: "The React Framework for the Web", url: "https://github.com/vercel/next.js", boost: 10000, clicks: 218 },
  { type: "user", github: "tj", name: "TJ Holowaychuk", avatar: "https://avatars.githubusercontent.com/u/25254", stars: 290000, forks: 0, followers: 34000, repos: 280, language: null, bio: "Creator of Express, Koa, Commander, and many more.", url: "https://github.com/tj", boost: 8500, clicks: 156 },
  { type: "repo", github: "denoland/deno", name: "deno", avatar: "https://avatars.githubusercontent.com/u/42048915", stars: 101000, forks: 5400, followers: 0, repos: 0, language: "Rust", bio: "A modern runtime for JavaScript and TypeScript.", url: "https://github.com/denoland/deno", boost: 7000, clicks: 89 },
  { type: "user", github: "antfu", name: "Anthony Fu", avatar: "https://avatars.githubusercontent.com/u/11247099", stars: 180000, forks: 0, followers: 22000, repos: 420, language: null, bio: "A fanatical open sourcerer. Core team of Vue, Nuxt, Vite.", url: "https://github.com/antfu", boost: 5500, clicks: 67 },
  { type: "repo", github: "tailwindlabs/tailwindcss", name: "tailwindcss", avatar: "https://avatars.githubusercontent.com/u/67109815", stars: 86000, forks: 4300, followers: 0, repos: 0, language: "TypeScript", bio: "A utility-first CSS framework for rapid UI development.", url: "https://github.com/tailwindlabs/tailwindcss", boost: 4500, clicks: 45 },
  { type: "user", github: "ThePrimeagen", name: "ThePrimeagen", avatar: "https://avatars.githubusercontent.com/u/4458174", stars: 12000, forks: 0, followers: 15000, repos: 90, language: null, bio: "Software engineer and creator.", url: "https://github.com/ThePrimeagen", boost: 3800, clicks: 34 },
  { type: "repo", github: "vuejs/vue", name: "vue", avatar: "https://avatars.githubusercontent.com/u/6128107", stars: 208000, forks: 33800, followers: 0, repos: 0, language: "TypeScript", bio: "The progressive JavaScript framework.", url: "https://github.com/vuejs/vue", boost: 3300, clicks: 312 },
  { type: "user", github: "yyx990803", name: "Evan You", avatar: "https://avatars.githubusercontent.com/u/499550", stars: 420000, forks: 0, followers: 95000, repos: 180, language: null, bio: "Creator of Vue.js and Vite.", url: "https://github.com/yyx990803", boost: 2900, clicks: 287 },
  { type: "repo", github: "microsoft/TypeScript", name: "TypeScript", avatar: "https://avatars.githubusercontent.com/u/6154722", stars: 102000, forks: 12500, followers: 0, repos: 0, language: "TypeScript", bio: "TypeScript is JavaScript with syntax for types.", url: "https://github.com/microsoft/TypeScript", boost: 2600, clicks: 198 },
  { type: "user", github: "rauchg", name: "Guillermo Rauch", avatar: "https://avatars.githubusercontent.com/u/13041", stars: 45000, forks: 0, followers: 28000, repos: 120, language: null, bio: "CEO at Vercel. Creator of Socket.IO and Mongoose.", url: "https://github.com/rauchg", boost: 2300, clicks: 176 },
  { type: "repo", github: "golang/go", name: "go", avatar: "https://avatars.githubusercontent.com/u/4314092", stars: 125000, forks: 17800, followers: 0, repos: 0, language: "Go", bio: "The Go programming language.", url: "https://github.com/golang/go", boost: 2100, clicks: 165 },
  { type: "user", github: "mitsuhiko", name: "Armin Ronacher", avatar: "https://avatars.githubusercontent.com/u/7396", stars: 150000, forks: 0, followers: 18000, repos: 340, language: null, bio: "Creator of Flask, Jinja, and Sentry.", url: "https://github.com/mitsuhiko", boost: 1900, clicks: 143 },
  { type: "repo", github: "rust-lang/rust", name: "rust", avatar: "https://avatars.githubusercontent.com/u/5430905", stars: 100000, forks: 13000, followers: 0, repos: 0, language: "Rust", bio: "Empowering everyone to build reliable and efficient software.", url: "https://github.com/rust-lang/rust", boost: 1700, clicks: 134 },
  { type: "user", github: "kentcdodds", name: "Kent C. Dodds", avatar: "https://avatars.githubusercontent.com/u/1500684", stars: 95000, forks: 0, followers: 32000, repos: 450, language: null, bio: "Improving the world with quality software.", url: "https://github.com/kentcdodds", boost: 1500, clicks: 112 },
  { type: "repo", github: "sveltejs/svelte", name: "svelte", avatar: "https://avatars.githubusercontent.com/u/23617963", stars: 81000, forks: 4300, followers: 0, repos: 0, language: "JavaScript", bio: "Cybernetically enhanced web apps.", url: "https://github.com/sveltejs/svelte", boost: 1300, clicks: 98 },
  { type: "user", github: "Rich-Harris", name: "Rich Harris", avatar: "https://avatars.githubusercontent.com/u/1162160", stars: 120000, forks: 0, followers: 14000, repos: 200, language: null, bio: "Creator of Svelte.", url: "https://github.com/Rich-Harris", boost: 1100, clicks: 87 },
  { type: "repo", github: "microsoft/vscode", name: "vscode", avatar: "https://avatars.githubusercontent.com/u/6154722", stars: 166000, forks: 30000, followers: 0, repos: 0, language: "TypeScript", bio: "Visual Studio Code, code editing redefined.", url: "https://github.com/microsoft/vscode", boost: 950, clicks: 76 },
  { type: "user", github: "wycats", name: "Yehuda Katz", avatar: "https://avatars.githubusercontent.com/u/4", stars: 65000, forks: 0, followers: 10000, repos: 310, language: null, bio: "Co-creator of Ember.js and Rust core team member.", url: "https://github.com/wycats", boost: 850, clicks: 65 },
  { type: "repo", github: "django/django", name: "django", avatar: "https://avatars.githubusercontent.com/u/27804", stars: 82000, forks: 32000, followers: 0, repos: 0, language: "Python", bio: "The web framework for perfectionists with deadlines.", url: "https://github.com/django/django", boost: 750, clicks: 58 },
  { type: "user", github: "getify", name: "Kyle Simpson", avatar: "https://avatars.githubusercontent.com/u/150330", stars: 180000, forks: 0, followers: 45000, repos: 130, language: null, bio: "Author of You Don't Know JS.", url: "https://github.com/getify", boost: 650, clicks: 49 },
  { type: "repo", github: "pallets/flask", name: "flask", avatar: "https://avatars.githubusercontent.com/u/16748505", stars: 69000, forks: 16200, followers: 0, repos: 0, language: "Python", bio: "The Python micro framework for building web applications.", url: "https://github.com/pallets/flask", boost: 550, clicks: 42 },
  { type: "user", github: "substack", name: "James Halliday", avatar: "https://avatars.githubusercontent.com/u/12631", stars: 110000, forks: 0, followers: 12000, repos: 900, language: null, bio: "Prolific open source developer. Author of browserify.", url: "https://github.com/substack", boost: 450, clicks: 38 },
  { type: "repo", github: "docker/compose", name: "docker-compose", avatar: "https://avatars.githubusercontent.com/u/5429470", stars: 34000, forks: 5200, followers: 0, repos: 0, language: "Go", bio: "Define and run multi-container applications with Docker.", url: "https://github.com/docker/compose", boost: 350, clicks: 31 },
  { type: "user", github: "addyosmani", name: "Addy Osmani", avatar: "https://avatars.githubusercontent.com/u/110953", stars: 78000, forks: 0, followers: 42000, repos: 260, language: null, bio: "Engineering leader working on Google Chrome.", url: "https://github.com/addyosmani", boost: 250, clicks: 27 },
  { type: "repo", github: "expressjs/express", name: "express", avatar: "https://avatars.githubusercontent.com/u/5658226", stars: 65000, forks: 16000, followers: 0, repos: 0, language: "JavaScript", bio: "Fast, unopinionated, minimalist web framework for Node.js.", url: "https://github.com/expressjs/express", boost: 150, clicks: 22 },
  { type: "user", github: "developit", name: "Jason Miller", avatar: "https://avatars.githubusercontent.com/u/105127", stars: 55000, forks: 0, followers: 9500, repos: 200, language: null, bio: "Creator of Preact.", url: "https://github.com/developit", boost: 50, clicks: 18 },
] as const;

export const DEMO_LISTINGS: DemoListing[] = examples.map((listing, index) => ({
  ...listing,
  id: `demo-${listing.github.replace("/", "-").toLowerCase()}`,
  createdAt: new Date(Date.UTC(2026, 7, 21, 12, 0, 0) - index * 60 * 60 * 1000).toISOString(),
}));
