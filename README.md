# digital pulse

`digital pulse` is Ian Wood's personal internet project built with Next.js 16, React 19, and Tailwind CSS 4. It includes portfolio material, but it is broader than a resume site: a living snapshot of what he is doing now across running, reading, work, and GitHub activity.

Rather than acting like a static portfolio, the app blends authored content with live data:

- recent runs from Strava
- book shelves from Goodreads
- GitHub contribution activity from a public contributions API

## What the Site Includes

- **Now**: a top-level summary with pulse cards for the latest run and current book, plus a short bio
- **Running**: recent run history plus monthly rollups for mileage, pace, and time on feet
- **Reading**: currently reading, to-read, and books finished this year
- **Work**: experience, education, projects, recent GitHub activity, certifications, and skills

Golf, Movies, and Writing sections still exist in the codebase but are hidden. They're toggled off via the `GOLF_ENABLED`, `MOVIES_ENABLED`, and `WRITING_ENABLED` flags at the top of `app/page.tsx`.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- `rss-parser`, `gray-matter`, and `marked` (used by the currently hidden Movies and Writing sections)

## Local Development

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other useful commands:

```bash
npm run lint
npm run build
npm run start
```

## Environment Variables

Only the Strava integration requires private credentials locally. Copy `.env.example` to `.env.local` and fill in:

```bash
STRAVA_CLIENT_ID=...
STRAVA_CLIENT_SECRET=...
STRAVA_REFRESH_TOKEN=...
```

If these values are missing, the running section stays visible but renders a not-connected state instead of making API calls.

## Data Sources

### Strava

A page of recent activities is fetched from the Strava API. The Running section filters it to runs and calculates monthly summary stats.

### Goodreads

Goodreads retired public RSS feeds in October 2026. Reading data now comes from the still-public grid widget (currently-reading and to-read) plus the Year in Books page for titles finished this calendar year.

### GitHub

Contribution data is fetched from `https://github-contributions-api.jogruber.de` and rendered as a yearly graph with total contributions and streak information.

## Project Structure

```text
app/
  page.tsx              Main homepage composition (section toggles live here)
  sidebar-shell.tsx     Sidebar with nav and contact/resume links
  running-section.tsx   Running dashboard UI
  book-shelf.tsx        Reading UI
  github-graph.tsx      GitHub contribution graph
  pulse-card.tsx        Summary cards in the hero section
  lib/
    books.ts            Goodreads ingestion
    github.ts           GitHub contribution fetcher
    strava.ts           Strava auth, fetch, and run stats

public/                 Static images
docs/mockup.html        Design/reference mockup
```

## Strava Setup

To obtain Strava credentials:

1. Create an app at [https://www.strava.com/settings/api](https://www.strava.com/settings/api). Set the Authorization Callback Domain to `localhost`.
2. Authorize the `activity:read_all` scope:

   ```text
   https://www.strava.com/oauth/authorize?client_id=<id>&response_type=code&redirect_uri=http://localhost&approval_prompt=force&scope=activity:read_all
   ```

3. After approving, copy the `code` query parameter from the redirect URL.
4. Exchange the code for a refresh token:

   ```bash
   curl -X POST https://www.strava.com/api/v3/oauth/token \
     -d client_id=<id> \
     -d client_secret=<secret> \
     -d code=<code> \
     -d grant_type=authorization_code
   ```

5. Copy the returned `refresh_token` into `.env.local`.

## Notes

- Strava responses are cached and revalidated periodically.
- Goodreads and GitHub data are public-source reads and require no local secrets.
