import Parser from "rss-parser";

export interface BookItem {
  title: string;
  author_name?: string;
  book_image_url?: string;
  book_large_image_url?: string;
  user_rating?: string;
  user_read_at?: string;
  guid?: string;
}

interface BookCustomFields {
  book_image_url?: string;
  book_large_image_url?: string;
  book_small_image_url?: string;
  author_name?: string;
  user_rating?: string;
  user_read_at?: string;
  user_shelves?: string;
  isbn?: string;
  book_published?: string;
}

export interface FetchBooksResult {
  currentlyReading: BookItem[];
  wantToRead: BookItem[];
  readThisYear: BookItem[];
}

const FEED_BASE = "https://www.goodreads.com/review/list_rss/89794111";

const FEEDS = {
  currentlyReading: `${FEED_BASE}?shelf=currently-reading`,
  wantToRead: `${FEED_BASE}?shelf=to-read`,
  read: `${FEED_BASE}?shelf=read`,
} as const;

function makeParser() {
  return new Parser<Record<string, unknown>, BookCustomFields>({
    customFields: {
      item: [
        "book_image_url",
        "book_large_image_url",
        "book_small_image_url",
        "author_name",
        "user_rating",
        "user_read_at",
        "user_shelves",
        "isbn",
        "book_published",
      ],
    },
  });
}

function toBookItem(
  item: BookCustomFields & { title?: string; guid?: string }
): BookItem {
  return {
    title: item.title ?? "",
    author_name: item.author_name,
    book_image_url: item.book_image_url,
    book_large_image_url: item.book_large_image_url,
    user_rating: item.user_rating,
    user_read_at: item.user_read_at,
    guid: item.guid,
  };
}

async function fetchShelf(url: string): Promise<BookItem[]> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ai-portfolio/1.0)" },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const parser = makeParser();
    const feed = await parser.parseString(xml);
    return (feed.items ?? []).map((it) => toBookItem(it));
  } catch {
    return [];
  }
}

export async function fetchBooks(): Promise<FetchBooksResult> {
  const [currentlyReading, wantToRead, readAll] = await Promise.all([
    fetchShelf(FEEDS.currentlyReading),
    fetchShelf(FEEDS.wantToRead),
    fetchShelf(FEEDS.read),
  ]);

  const readThisYear = readAll.filter((b) => {
    if (!b.user_read_at) return false;
    const d = new Date(b.user_read_at);
    if (Number.isNaN(d.getTime())) return false;
    return d.getUTCFullYear() === 2026;
  });

  return { currentlyReading, wantToRead, readThisYear };
}
