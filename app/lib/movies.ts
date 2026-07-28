import Parser from "rss-parser";

export interface MovieItem {
  title: string;
  year?: string;
  /** 0–5, in half-star steps. Undefined when the entry was logged without a rating. */
  rating?: number;
  /** ISO date (yyyy-mm-dd) the film was watched, per the diary entry. */
  watchedDate?: string;
  rewatch: boolean;
  posterUrl?: string;
  link?: string;
  guid?: string;
}

export interface FetchMoviesResult {
  recent: MovieItem[];
  watchedThisYear: MovieItem[];
  /** The calendar year `watchedThisYear` was filtered on. */
  year: number;
}

interface MovieCustomFields {
  filmTitle?: string;
  filmYear?: string;
  memberRating?: string;
  watchedDate?: string;
  rewatch?: string;
}

type RawItem = MovieCustomFields & {
  title?: string;
  link?: string;
  guid?: string;
  content?: string;
  isoDate?: string;
  pubDate?: string;
};

const FEED_URL = "https://letterboxd.com/ianwood103/rss/";

// Letterboxd puts the diary metadata in its own namespace; rss-parser keeps the
// prefix on the tag name, so each one has to be mapped explicitly.
function makeParser() {
  return new Parser<Record<string, unknown>, MovieCustomFields>({
    customFields: {
      item: [
        ["letterboxd:filmTitle", "filmTitle"],
        ["letterboxd:filmYear", "filmYear"],
        ["letterboxd:memberRating", "memberRating"],
        ["letterboxd:watchedDate", "watchedDate"],
        ["letterboxd:rewatch", "rewatch"],
      ],
    },
  });
}

// Item titles look like "Dune, 2021 - ★★★★½" (the rating half is dropped when
// the entry is unrated). Used as a fallback when the namespaced fields are gone.
const TITLE_PATTERN = /^(.*),\s*(\d{4})\s*(?:-\s*(.*))?$/;

function starsToNumber(stars: string): number | undefined {
  const full = (stars.match(/★/g) ?? []).length;
  const half = stars.includes("½") ? 0.5 : 0;
  const rating = full + half;
  return rating > 0 ? rating : undefined;
}

function parseRating(item: RawItem): number | undefined {
  const member = Number.parseFloat(item.memberRating ?? "");
  if (!Number.isNaN(member) && member > 0) {
    return Math.max(0, Math.min(5, member));
  }
  const match = TITLE_PATTERN.exec(item.title ?? "");
  return match?.[3] ? starsToNumber(match[3]) : undefined;
}

// The poster only exists inside the description HTML, ahead of the review body.
function parsePoster(html?: string): string | undefined {
  if (!html) return undefined;
  return /<img[^>]+src=["']([^"']+)["']/i.exec(html)?.[1];
}

function toMovieItem(item: RawItem): MovieItem | null {
  const match = TITLE_PATTERN.exec(item.title ?? "");
  const title = item.filmTitle ?? match?.[1];
  // Lists and other non-diary entries share the feed but carry no film title.
  if (!title) return null;

  return {
    title,
    year: item.filmYear ?? match?.[2],
    rating: parseRating(item),
    watchedDate: item.watchedDate,
    rewatch: item.rewatch === "Yes",
    posterUrl: parsePoster(item.content),
    link: item.link,
    guid: item.guid,
  };
}

function sortKey(movie: MovieItem, item: RawItem): number {
  const raw = movie.watchedDate ?? item.isoDate ?? item.pubDate;
  const time = raw ? new Date(raw).getTime() : Number.NaN;
  return Number.isNaN(time) ? 0 : time;
}

export async function fetchMovies(): Promise<FetchMoviesResult> {
  const year = new Date().getUTCFullYear();

  let items: RawItem[] = [];
  try {
    const res = await fetch(FEED_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ai-portfolio/1.0)" },
    });
    if (res.ok) {
      const feed = await makeParser().parseString(await res.text());
      items = (feed.items ?? []) as RawItem[];
    }
  } catch {
    items = [];
  }

  const recent = items
    .map((item) => {
      const movie = toMovieItem(item);
      return movie ? { movie, at: sortKey(movie, item) } : null;
    })
    .filter((entry): entry is { movie: MovieItem; at: number } => entry !== null)
    .sort((a, b) => b.at - a.at)
    .map((entry) => entry.movie);

  const watchedThisYear = recent.filter((movie) => {
    if (!movie.watchedDate) return false;
    const d = new Date(movie.watchedDate);
    if (Number.isNaN(d.getTime())) return false;
    return d.getUTCFullYear() === year;
  });

  return { recent, watchedThisYear, year };
}
