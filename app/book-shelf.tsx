"use client";

interface BookItem {
  title: string;
  author_name?: string;
  book_image_url?: string;
  book_large_image_url?: string;
  user_rating?: string;
  user_read_at?: string;
  guid?: string;
}

interface BookShelfProps {
  currentlyReading: BookItem[];
  wantToRead: BookItem[];
  readThisYear: BookItem[];
}

const stars = (n: number) => {
  const clamped = Math.max(0, Math.min(5, Number.isNaN(n) ? 0 : n));
  return "★".repeat(clamped) + "☆".repeat(5 - clamped);
};

function CurrentHero({ book }: { book: BookItem }) {
  const cover = book.book_large_image_url || book.book_image_url;
  const inner = (
    <>
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover}
          alt={book.title}
          className="book-cover"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="book-no-cover">{book.title}</div>
      )}
      <div>
        <div
          className="book-status-pill"
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <span className="pulse-dot green" />
          Currently reading
        </div>
        <div className="book-title">{book.title}</div>
        {book.author_name && (
          <div className="book-author">{book.author_name}</div>
        )}
      </div>
    </>
  );

  if (book.guid) {
    return (
      <a
        href={book.guid}
        className="book-current"
        target="_blank"
        rel="noopener noreferrer"
      >
        {inner}
      </a>
    );
  }
  return <div className="book-current">{inner}</div>;
}

function BookThumb({ book }: { book: BookItem }) {
  const cover = book.book_large_image_url || book.book_image_url;
  const rating = parseInt(book.user_rating ?? "0", 10);
  const inner = (
    <>
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover}
          alt={book.title}
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="book-no-cover">{book.title}</div>
      )}
      <div className="book-thumb-title">{book.title}</div>
      {book.author_name && (
        <div className="book-thumb-author">{book.author_name}</div>
      )}
      <span className="book-stars">{stars(rating)}</span>
    </>
  );

  if (book.guid) {
    return (
      <a
        href={book.guid}
        className="book-thumb"
        target="_blank"
        rel="noopener noreferrer"
      >
        {inner}
      </a>
    );
  }
  return <div className="book-thumb">{inner}</div>;
}

export default function BookShelf({
  currentlyReading,
  wantToRead,
  readThisYear,
}: BookShelfProps) {
  const wantToReadCapped = wantToRead.slice(0, 12);

  return (
    <div>
      {currentlyReading.length > 0 && (
        <div className="current-books">
          {currentlyReading.map((book, i) => (
            <CurrentHero key={book.guid ?? `${book.title}-${i}`} book={book} />
          ))}
        </div>
      )}

      {readThisYear.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div className="shelf-label">Read in 2026</div>
          <div className="books-grid">
            {readThisYear.map((book, i) => (
              <BookThumb key={book.guid ?? `${book.title}-${i}`} book={book} />
            ))}
          </div>
        </div>
      )}

      {wantToReadCapped.length > 0 && (
        <div>
          <div className="shelf-label">Want to Read</div>
          <ul className="want-list">
            {wantToReadCapped.map((book, i) => (
              <li key={book.guid ?? `${book.title}-${i}`} className="want-item">
                <span>{book.title}</span>
                {book.author_name && (
                  <span className="want-item-author">{book.author_name}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
