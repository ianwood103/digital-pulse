export interface BookItem {
  title: string;
  author_name?: string;
  book_image_url?: string;
  book_large_image_url?: string;
  user_rating?: string;
  user_read_at?: string;
  guid?: string;
}

export interface FetchBooksResult {
  currentlyReading: BookItem[];
  wantToRead: BookItem[];
  readThisYear: BookItem[];
}

const USER_ID = "89794111";
const PROFILE_SLUG = `${USER_ID}-ian-wood`;
const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

// Goodreads retired public RSS in October 2026. The unauthenticated grid
// widget and Year in Books pages are what still expose a public shelf.

function widgetUrl(shelf: string, sort: string) {
  const params = new URLSearchParams({
    cover_size: "medium",
    num_books: "50",
    order: "d",
    shelf,
    sort,
    widget_id: "gr",
  });
  return `https://www.goodreads.com/review/grid_widget/${USER_ID}?${params}`;
}

function yearInBooksUrl(year: number) {
  return `https://www.goodreads.com/user/year_in_books/${year}/${USER_ID}`;
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    if (!res.ok) {
      console.error(`Goodreads fetch ${res.status} for ${url}`);
      return null;
    }
    return await res.text();
  } catch (err) {
    console.error(
      `Goodreads fetch error for ${url}: ${err instanceof Error ? err.message : String(err)}`
    );
    return null;
  }
}

function decodeWidgetHtml(jsString: string): string {
  return jsString
    .replace(/\\n/g, "\n")
    .replace(/\\\//g, "/")
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

function parseWidget(js: string): BookItem[] {
  const match = js.match(/var widget_code = '([\s\S]*?)'\s*\n\s*var widget_div/);
  if (!match) return [];

  const html = decodeWidgetHtml(match[1]);
  const books: BookItem[] = [];
  const itemRe =
    /<div class="gr_grid_book_container"><a title="([^"]*)" rel="nofollow" href="([^"]+)"><img alt="([^"]*)" border="0" src="([^"]+)"/g;

  for (const item of html.matchAll(itemRe)) {
    const title = item[1].replace(/\s+/g, " ").trim();
    if (!title) continue;
    const href = item[2].replace(/[?&]utm_[^&]+/g, "").replace(/[?&]$/, "");
    const cover = item[4];
    books.push({
      title,
      book_image_url: cover,
      book_large_image_url: cover,
      guid: href || `https://www.goodreads.com/user/show/${PROFILE_SLUG}`,
    });
  }

  return books;
}

function splitTitleAuthor(alt: string): { title: string; author_name?: string } {
  const idx = alt.lastIndexOf(" by ");
  if (idx <= 0) return { title: alt.trim() };
  return {
    title: alt.slice(0, idx).trim(),
    author_name: alt.slice(idx + 4).trim() || undefined,
  };
}

function parseYearInBooks(html: string): BookItem[] {
  const books: BookItem[] = [];
  const seen = new Set<string>();
  const imgRe =
    /<img[^>]*alt="([^"]+ by [^"]+)"[^>]*src="(https:\/\/i\.gr-assets\.com\/images\/[^"]+)"[^>]*>/g;

  for (const item of html.matchAll(imgRe)) {
    const { title, author_name } = splitTitleAuthor(item[1]);
    const key = title.toLowerCase();
    if (!title || seen.has(key)) continue;
    seen.add(key);
    books.push({
      title,
      author_name,
      book_image_url: item[2],
      book_large_image_url: item[2],
    });
  }

  return books;
}

function titlesMatch(widgetTitle: string, yearTitle: string): boolean {
  const stripped = widgetTitle.replace(/\s*\([^)]*\)\s*$/, "").trim().toLowerCase();
  const year = yearTitle.toLowerCase();
  return stripped === year || widgetTitle.toLowerCase().startsWith(year);
}

async function fetchShelf(
  shelf: string,
  sort: "date_read" | "date_added" | "date_updated"
): Promise<BookItem[]> {
  const body = await fetchText(widgetUrl(shelf, sort));
  return body ? parseWidget(body) : [];
}

export async function fetchBooks(): Promise<FetchBooksResult> {
  const year = new Date().getUTCFullYear();

  const [currentlyReading, wantToRead, readRecent, yearHtml] = await Promise.all([
    fetchShelf("currently-reading", "date_updated"),
    fetchShelf("to-read", "date_added"),
    fetchShelf("read", "date_read"),
    fetchText(yearInBooksUrl(year)),
  ]);

  const yearBooks = yearHtml ? parseYearInBooks(yearHtml) : [];
  const used = new Set<string>();
  const readThisYear: BookItem[] = [];

  for (const recent of readRecent) {
    const match = yearBooks.find((book) => titlesMatch(recent.title, book.title));
    if (!match || used.has(match.title.toLowerCase())) continue;
    used.add(match.title.toLowerCase());
    readThisYear.push({
      ...match,
      guid: recent.guid ?? match.guid,
    });
  }

  for (const book of yearBooks) {
    if (used.has(book.title.toLowerCase())) continue;
    readThisYear.push(book);
  }

  return { currentlyReading, wantToRead, readThisYear };
}
