# Uulzy — Design Spec (v0.1 MVP)

**Date:** 2026-09-17
**Status:** MVP built from this spec; every decision here is a default the owner can override.

## 1. What Uulzy is

Uulzy ("уулзах" — to meet) is a city guide + social planning platform for Ulaanbaatar:

1. **Directory** — every recorded service place (restaurants, cafes, shops, karaoke, cinemas, spas, etc.) with an estimated price range in MNT.
2. **Crowdsourced prices** — users submit menus/price items; admins approve before they go live.
3. **Templates ("Plans")** — a builder where anyone composes a date/hangout plan from activities, each with a time window and price range; totals are computed. Templates can be private or public, voted on, and ranked on a leaderboard.
4. **Ratings & comments** — on places and on templates.
5. **Meetups** — "I'm doing X, who wants to join?" posts with join requests.

## 2. Similar platforms (prior art)

- **Google Maps / Yelp / Foursquare / Tripadvisor** — directory + reviews + price tier ($–$$$$), but no crowdsourced *menu-level* prices and no plan builder.
- **Wanderlog / TripIt** — itinerary builders with cost tracking, but travel-oriented, no voting/leaderboard, no local social layer.
- **Meetup / Timeleft / Eventbrite** — activity partner finding, but no directory or pricing.
- **MangoPlate / Naver Place (Korea), Dianping (China)** — closest analogues: local-language directory + crowdsourced prices + curated courses. Dianping's "курс/course" lists are similar to Uulzy templates.
- Nothing combines all four pillars for Ulaanbaatar. Uulzy's moat = local MNT price data + the plan-template social loop.

## 3. Tech stack (MVP defaults)

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router, TS) | One codebase for site + API; deploys to Vercel free tier; later reuse API for a React Native/Expo app |
| Styling | Tailwind CSS v4 | Fast iteration |
| DB / ORM | SQLite via Prisma (dev) → Postgres (Supabase/Neon) in prod | Zero-setup locally; one-line datasource swap |
| Auth | Cookie sessions, bcryptjs + signed HttpOnly cookie | No provider lock-in; swap for NextAuth/Clerk later |
| Images | Deferred (URL field only in MVP) | Real uploads → UploadThing / Supabase Storage in Phase 2 |

## 4. Data model

- **User** (id, email, name, passwordHash, role: USER|ADMIN, points)
- **Place** (name, slug, category, district, address, description, priceMin, priceMax, status PENDING|APPROVED, avgRating denorm)
- **Category** enum: RESTAURANT, CAFE, BAR_PUB, KARAOKE, SHOP, CINEMA, ENTERTAINMENT, BEAUTY_SPA, SPORT, CULTURE, OTHER
- **PriceItem** (placeId, name, price, submittedById, status PENDING|APPROVED|REJECTED) — the crowdsourced menu/price rows
- **Review** (placeId, userId, rating 1–5, comment) — one per user per place
- **Template** (title, description, isPublic, authorId, computed totals) with **TemplateItem** (order, placeId?, freeText activity, startTime, endTime, priceMin, priceMax)
- **TemplateVote** (templateId, userId, value +1/−1) — score = sum; leaderboard = order by score
- **TemplateComment** (templateId, userId, body)
- **Meetup** (title, description, placeId?, location, dateTime, capacity, hostId, status OPEN|FULL|CLOSED) with **MeetupJoin** (meetupId, userId, status PENDING|ACCEPTED|DECLINED)

Moderation rule: everything user-generated that changes *facts* (places, price items) is PENDING until an admin approves. Opinions (reviews, comments, votes, templates, meetups) go live immediately, admin can remove.

## 5. Pages

- `/` home: search, category grid, top templates, recent meetups
- `/places` (filter: category, district, price, search) · `/places/[slug]` (info, approved menu, reviews, "submit a price" form) · `/places/new` (suggest a place → pending)
- `/templates` (browse + leaderboard toggle) · `/templates/new` (builder) · `/templates/[id]` (timeline view, totals, vote, comments)
- `/meetups` · `/meetups/new` · `/meetups/[id]` (join / host manages requests)
- `/login`, `/register`, `/profile` (my templates, my submissions, my meetups)
- `/admin` (queues: pending places, pending price items; admin-only)

## 6. API surface (route handlers under /api)

Auth: register, login, logout, me. Places: list/get/create, price-items create. Reviews: upsert. Templates: CRUD, vote, comment. Meetups: CRUD, join, manage joins. Admin: approve/reject place & price-item.
All mutations require session; admin routes check role. Zod-validated bodies.

## 7. Phasing

- **Phase 1 (this build):** everything in §4–§6 with seed data (~25 real UB places, demo users, sample templates/meetups), English UI.
- **Phase 2:** Mongolian/English i18n, image uploads, map view (Leaflet + OSM), password reset via email, notifications, user points/badges for approved submissions.
- **Phase 3:** Mobile app (Expo, reusing the API), in-app chat for meetups, business-owner claimed profiles (monetization), promoted listings.

## 8. Testing

Vitest unit tests for the pure logic (template totals, leaderboard scoring, slug generation, validation schemas). Route handlers kept thin; heavier E2E (Playwright) deferred to Phase 2.

## 9. Risks / open decisions for the owner

- **Language:** MVP is English; a Mongolian-first UI is likely correct for the market — decide before public launch.
- **Trust & safety:** meetups connect strangers; add report/block + phone verification before real launch.
- **Cold start:** directory needs ~200+ places with prices to be useful; consider importing from Google Places API (ToS limits caching prices — manual entry/community seeding is safer).
- **Name/domain:** uulzy.mn availability not checked.
