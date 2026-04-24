# digital pulse

`digital pulse` is Ian Wood's personal internet project built with Next.js 16, React 19, and Tailwind CSS 4. It includes portfolio material, but it is broader than a resume site: a living snapshot of what he is doing now across running, reading, writing, work, and GitHub activity.

Rather than acting like a static portfolio, the app blends authored content with live data:

- recent runs from Strava
- book shelves from Goodreads RSS
- writing pulled from local Markdown files
- GitHub contribution activity from a public contributions API

## What the Site Includes

- **Now**: a top-level summary with pulse cards for the latest run, current book, and newest post
- **Running**: recent run history plus monthly rollups for mileage, pace, and time on feet
- **Reading**: currently reading, to-read, and books finished in 2026
- **Writing**: posts sourced from `content/posts/*.md`
- **Work**: experience timeline and background
- **GitHub activity**: contribution graph and summary stats

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- `gray-matter` for Markdown frontmatter
- `marked` for post rendering
- `rss-parser` for Goodreads RSS feeds

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

The running section fetches recent activities from the Strava API, filters to runs, and calculates monthly summary stats.

### Goodreads

Reading shelves are pulled from Goodreads RSS feeds for:

- currently reading
- to-read
- read

The app currently filters the `read` shelf down to books finished in 2026.

### Writing

Posts live in `content/posts/` as Markdown files with frontmatter. They are read from disk at build/request time and sorted newest-first.

### GitHub

Contribution data is fetched from `https://github-contributions-api.jogruber.de` and rendered as a yearly graph with total contributions and streak information.

## Project Structure

```text
app/
  page.tsx              Main homepage composition
  running-section.tsx   Running dashboard UI
  book-shelf.tsx        Reading UI
  github-graph.tsx      GitHub contribution graph
  pulse-card.tsx        Summary cards in the hero section
  lib/
    books.ts            Goodreads ingestion
    posts.ts            Markdown post loading
    github.ts           GitHub contribution fetcher
    strava.ts           Strava auth, fetch, and run stats

content/posts/          Markdown writing archive
public/                 Static images
docs/mockup.html        Design/reference mockup
```

## Writing a New Post

Add a Markdown file under `content/posts/` with frontmatter like:

```md
---
title: Example Post
date: 2026-04-23
readTime: 4 min
excerpt: Short summary shown on the homepage.
---
```

The post list on the homepage will pick it up automatically.

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
- The README previously reflected the default Next.js starter; it now documents `digital pulse` as the actual application.
