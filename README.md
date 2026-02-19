# Alex – MCAT Exam Study

Next.js app with PostgreSQL: sections, segments, and questions are stored in the database. Progress and daily stats are persisted per client (anonymous `client_id` in localStorage).

## Setup

1. **Create a PostgreSQL database**  
   Use [Vercel Storage](https://vercel.com/docs/storage) (e.g. Neon), Supabase, or any Postgres host. Copy the connection string.

2. **Environment**  
   Create `.env` in the project root:
   ```env
   DATABASE_URL=postgresql://...
   ```

3. **Schema and seed**  
   From the project root:
   ```bash
   npm install
   npm run db:setup
   npm run db:seed
   ```
   (`db:seed` requires `scripts/seed-questions.json`; run `node scripts/extract-seed-json.js` once to generate it from `demo.js`.)

4. **Run locally**  
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel (project name: Alex)

1. Push the repo and import the project in Vercel under your account (e.g. under “juelzs” / your team). Name the project **Alex**.

2. In Vercel → Project → Settings → Environment Variables, add:
   - `DATABASE_URL` = your Postgres connection string (Production, Preview, Development if needed).

3. After the first deploy, run migrations and seed against the same database (from your machine or a one-off script):
   ```bash
   DATABASE_URL="your-production-url" npm run db:setup
   DATABASE_URL="your-production-url" npm run db:seed
   ```

4. Redeploy or trigger a new deployment so the app uses the seeded data.

## Scripts

- `npm run dev` – local dev server
- `npm run build` – production build
- `npm run start` – run production build locally
- `npm run db:setup` – apply `scripts/schema.sql`
- `npm run db:seed` – insert sections and questions (requires `seed-questions.json`)
- `node scripts/extract-seed-json.js` – generate `seed-questions.json` from `demo.js`

## Data model

- **sections** / **segments** – MCAT sections and segments (labels, colors, icons).
- **questions** – seed questions plus custom questions per `client_id`.
- **progress** – per client/segment/question: attempts, correct, streak, notes, last_seen.
- **daily** – per client/day: attempts and correct count.

All content is read from the database; no hardcoded question bank in the app.
