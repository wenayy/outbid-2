# Outbid

A paid GitHub leaderboard built with Next.js, Prisma, Neon Postgres, and Polar.

## Local development

Create `.env` from `.env.example`, then install dependencies and apply the database migration:

```bash
npm install
npx prisma migrate deploy
npx prisma db seed # only for a new, empty database
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Vercel environment

Set these variables for Production and Preview, then redeploy:

- `DATABASE_URL`: Neon pooled connection string
- `DIRECT_URL`: Neon direct connection string, used by Prisma migrations
- `GITHUB_TOKEN`: optional GitHub API token
- `POLAR_ACCESS_TOKEN`: Polar organization access token
- `POLAR_WEBHOOK_SECRET`: secret for the Polar webhook endpoint at `/api/webhook`
- `POLAR_SERVER`: `production` or `sandbox`
- `NEXT_PUBLIC_APP_URL`: deployed site origin, such as `https://example.com`

Run `npx prisma migrate deploy` once against the production database before serving traffic. Production deliberately rejects listing checkout when Polar is not configured.
