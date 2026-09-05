# digital pulse

`digital pulse` is Ian Wood's personal internet project built with Next.js 16, React 19, and Tailwind CSS 4. It includes portfolio material, but it is broader than a resume site: a living snapshot of what he is doing now across running, reading, writing, work, and GitHub activity.

Rather than acting like a static portfolio, the app blends authored content with live data:

- recent runs and golf rounds from Strava
- book shelves from Goodreads RSS
- writing pulled from local Markdown files
- GitHub contribution activity from a public contributions API

## What the Site Includes

- **Now**: a top-level summary with pulse cards for the latest run, latest golf round, current book, and newest post
- **Running**: recent run history plus monthly rollups for mileage, pace, and time on feet
- **Golf**: recent rounds with the course played and the photos attached to each Strava activity
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

A single page of recent activities is fetched from the Strava API and shared by both sections:

- **Running** filters the page to runs and calculates monthly summary stats.
- **Golf** filters to `Golf` activities and, for each one, fetches the photos attached to that activity. The activity title is used as the course name, since rounds are always titled with where they were played. If the photo endpoint is unavailable, the section falls back to the primary photo on the activity summary.
- **Golf scores** are not available as Strava API fields. Gross score and course are OCR'd from the attached scorecard image with **Tesseract.js** (open source) plus `sharp` preprocessing, then cached under `.cache/golf-ocr/`. The golf section plots those totals as a score-over-time line chart.

Photos are rendered straight from Strava's CDN at the size Strava serves them, so they bypass the Next.js image optimizer.

To exercise the OCR path without Strava credentials, set `GOLF_OCR_FIXTURE=1` and run against the sample scorecard in `public/fixtures/golf-scorecard.jpg`:

```bash
GOLF_OCR_FIXTURE=1 npm run dev
npm run verify:golf-ocr
```

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
  golf-section.tsx      Golf rounds and activity photos
  book-shelf.tsx        Reading UI
  github-graph.tsx      GitHub contribution graph
  pulse-card.tsx        Summary cards in the hero section
  lib/
    books.ts            Goodreads ingestion
    posts.ts            Markdown post loading
    github.ts           GitHub contribution fetcher
    strava.ts           Strava auth, fetch, run stats, and golf rounds

content/posts/          Markdown writing archive
public/                 Static images
docs/mockup.html        Design/reference mockup
```

## Writing a New Post

Drop a Markdown file into `content/posts/`. The filename (minus `.md`) becomes the slug and URL: `content/posts/my-post.md` → `/posts/my-post`.

The minimum viable post is just a heading and some prose:

```md
# My Post Title

First paragraph here — this becomes the excerpt automatically.

Rest of the post...
```

Everything is derived from the file:

- **slug** — filename
- **title** — first `# heading` (stripped from the rendered body), or a title-cased filename
- **excerpt** — first paragraph, with markdown stripped
- **readTime** — computed from word count (~220 wpm)
- **date** — today, unless overridden

Any of these can be overridden via YAML frontmatter when you want explicit control. `date` is the one you'll typically want to set so posts don't all stack on "today":

```md
---
date: 2026-04-23
---

# My Post Title

Body...
```

Frontmatter fields are all optional: `title`, `date`, `readTime`, `excerpt`. The post list on the homepage picks up new files automatically and sorts newest-first.

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
