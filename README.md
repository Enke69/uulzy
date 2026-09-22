# Uulzy

**Ulaanbaatar, planned together.**

A city guide and social planning platform for Ulaanbaatar, built around these pillars:

1. **Map-first directory** — the home page is a live map of Ulaanbaatar. Pick a mood (Food & Drink, Fun, Shopping, Culture, Wellness) and the matching places appear as pins, with sub-category filters underneath.
2. **Crowdsourced prices** — users submit menu items and prices, optionally with a photo; admins approve before they go live.
3. **Plan templates** — a builder for date/hangout plans with per-activity time and price ranges, live totals, public/private visibility, voting, a leaderboard, and comments. Each plan draws its **route on a map**, following real roads, with per-leg distances and a Google Maps handoff.
4. **Activity media** — users post photos and videos of themselves doing things at a place ("me playing billiards"), shown in a gallery on the place page.
5. **Meetups** — "I'm doing X, who wants to join?" posts with host-managed join requests.

## Quick start

Uulzy needs a Postgres database. Free options: [Neon](https://neon.tech) or
[Supabase](https://supabase.com). Create one, then:

```bash
npm install
cp .env.example .env   # paste your Postgres URL into DATABASE_URL
npx prisma db push     # creates the tables
npm run db:seed        # ~25 real UB places, demo users, plans, meetups
npm run dev            # http://localhost:3000
```

If your provider gives both a **pooled** and a **direct** connection string, put
the pooled one in `.env` and run the schema commands against the direct one:

```bash
DATABASE_URL="<direct url>" npx prisma db push
DATABASE_URL="<direct url>" npm run db:seed
```

### Demo accounts

The seed creates `admin@uulzy.mn` plus a few demo users. **Passwords are never
committed** — this repo is public, and a published password is an open admin
account on a live database. The seed prints freshly generated passwords once,
when it runs; copy them then. To choose your own instead:

```bash
SEED_ADMIN_PASSWORD="..." SEED_DEMO_PASSWORD="..." npm run db:seed
```

Log in as the admin to see `/admin`, the approval queue for suggested places and submitted prices.

## Scripts

| Command           | What it does                              |
|-------------------|-------------------------------------------|
| `npm run dev`     | Dev server on :3000                       |
| `npm run build`   | Production build                          |
| `npm test`        | Vitest unit tests (totals, scoring, auth tokens) |
| `npm run db:push` | Sync the Prisma schema into the database  |
| `npm run db:seed` | Reset and reseed demo data                |
| `npm run db:studio` | Browse the database in Prisma Studio    |

## Architecture

- **Next.js 16 (App Router) + TypeScript** — pages are server components reading via Prisma directly; mutations go through `/api/*` route handlers.
- **Prisma + Postgres** everywhere, local included. Serverless hosts have no persistent filesystem, so SQLite is not an option there; using the same engine locally keeps behaviour identical. Name search uses `mode: "insensitive"`, which is Postgres-only.
- **Auth** — HMAC-signed session cookie (`src/lib/token.ts`), bcrypt password hashes, `requireUser()` / `requireAdmin()` guards in `src/lib/auth.ts`.
- **Validation** — zod schemas in `src/lib/validate.ts`; `handleErrors` in `src/lib/api.ts` turns zod and auth errors into clean JSON responses.
- **Pure logic** — price/time math, vote scoring, slug generation, distance math, and upload validation live in `src/lib/utils.ts` and `src/lib/upload.ts`, and are unit-tested.
- **Maps** — Leaflet + OpenStreetMap tiles, no API key and no per-load billing. Map components are client-only (`ssr: false` via `DynamicMaps.tsx`) because Leaflet touches `window` on import.

### Media uploads

`POST /api/uploads` stores a file in **Neon Object Storage** (S3-compatible) and returns its public URL. Nothing is written to local disk, so uploads survive redeploys.

The stored extension comes from the MIME map, never the client-supplied filename, and keys are random — a renamed file cannot choose its own extension or overwrite another. Anything referencing an upload is validated against the bucket's own public base URL, so external URLs and path traversal are rejected. Deleting a post also deletes the object: the bucket is `public_read`, so a surviving file would stay reachable by URL after the post was removed.

Requires the `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3`, and `AWS_REGION` variables Neon injects (`neon link` / `neon deploy` pull them into `.env`). Without them the route returns 503 rather than failing silently. The bucket name defaults to `uulzy`, overridable with `STORAGE_BUCKET`.

Limits: images 8MB (JPG, PNG, WebP, GIF), videos 50MB (MP4, WebM, MOV).

### Routing

A plan's route asks the public OSRM demo server for road geometry. That server is rate-limited and explicitly not for production traffic, so every failure falls back to straight dashed lines between stops — the map always renders. Before launch, either self-host OSRM or switch to a paid directions API. Per-leg distances shown in the list are straight-line (haversine), which reads slightly short versus real driving distance.

### Moderation model

Facts are moderated, opinions are not. Suggested **places** and submitted **price items** are `PENDING` until an admin approves them (approval awards contribution points). Reviews, comments, votes, plans, and meetups publish immediately.

## Key files

| Path | Purpose |
|------|---------|
| `prisma/schema.prisma` | Full data model |
| `prisma/seed.ts` | Demo data |
| `src/lib/utils.ts` | Totals, formatting, categories, mood groups, distance math |
| `src/lib/upload.ts` | Upload type/size validation and filename generation |
| `src/components/TemplateBuilder.tsx` | The plan builder |
| `src/components/map/CityMap.tsx` | Home-page map and mood filter |
| `src/components/map/RouteMap.tsx` | Plan route, road geometry, leg distances |
| `src/components/map/LocationPicker.tsx` | Click-to-pin when suggesting a place |
| `src/components/ActivityMedia.tsx` | Activity photo/video gallery |
| `src/app/admin/page.tsx` | Approval queue |
| `docs/superpowers/specs/2026-09-17-uulzy-design.md` | Design spec, prior art, roadmap |

## Deploying

1. **Create a Postgres database** (Neon or Supabase) and note the connection string.
2. **Set environment variables** on your host — copy the values from your local
   `.env`, which `neon link` populated:
   - `DATABASE_URL` — the pooled Postgres URL.
   - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3`,
     `AWS_REGION` — object storage, for uploads.
   - `SESSION_SECRET` — a long random value. Generate with
     `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`.
     Without it, auth falls back to a hardcoded dev value that anyone reading
     this public repo could use to forge sessions.
3. **Create the tables once**, from your machine, against the direct URL:
   `DATABASE_URL="<direct url>" npx prisma db push`
   (optionally `npm run db:seed` for the demo content).
4. **Deploy.** `prisma generate` runs automatically via the `postinstall` script —
   hosts block dependency install scripts, so this is what keeps Prisma Client
   present at build time.

`vercel.json` pins the deployment to `sin1` (Singapore) so the app runs next to
the database — each page makes several round trips, so that distance matters
more than the distance from your users to either.

## Before launching publicly

- Set a strong `SESSION_SECRET` in `.env` (and never commit the real one).
- Add Mongolian language support — likely Mongolian-first for this market.
- Add report/block and phone verification before letting strangers meet through Meetups.
- Replace the seeded price estimates **and coordinates** with verified data; both are approximations for demo purposes.
- **Moderate activity media.** Photos and videos publish immediately today (the uploader or an admin can delete). User-submitted media is an abuse vector, so add reporting and a review queue before opening signups.
- Replace the OSRM demo server, as described above — it is not licensed for production traffic.
- Delete the demo accounts entirely before real signups — they exist to demo the app, not to be real logins.
