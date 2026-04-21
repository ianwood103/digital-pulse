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

function Stars({ rating }: { rating?: string }) {
  const n = rating ? parseInt(rating, 10) : 0;
  const filled = Number.isNaN(n) ? 0 : Math.max(0, Math.min(5, n));
  const empty = 5 - filled;
  return (
    <span className="book-stars">
      {"★".repeat(filled)}
      {"☆".repeat(empty)}
    </span>
  );
}

function BookCard({
  book,
  showStars = false,
}: {
  book: BookItem;
  showStars?: boolean;
}) {
  const cover = book.book_large_image_url || book.book_image_url;
  const content = (
    <>
      <div className="book-cover-wrap">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={book.title} loading="lazy" />
        ) : (
          <div className="book-no-cover">{book.title}</div>
        )}
      </div>
      <div className="book-title">{book.title}</div>
      {book.author_name ? (
        <div className="book-author">{book.author_name}</div>
      ) : null}
      {showStars ? <Stars rating={book.user_rating} /> : null}
    </>
  );

  if (book.guid) {
    return (
      <a
        href={book.guid}
        className="book-card"
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }
  return <div className="book-card">{content}</div>;
}

export default function BookShelf({
  currentlyReading,
  wantToRead,
  readThisYear,
}: BookShelfProps) {
  const wantToReadCapped = wantToRead.slice(0, 12);

  return (
    <div className="book-shelf">
      <div>
        <div className="section-label">Currently Reading</div>
        <div className="book-row">
          {currentlyReading.map((b, i) => (
            <BookCard key={b.guid ?? `${b.title}-${i}`} book={b} />
          ))}
        </div>
      </div>

      <div>
        <div className="section-label">Read in 2026</div>
        <div className="book-grid">
          {readThisYear.map((b, i) => (
            <BookCard
              key={b.guid ?? `${b.title}-${i}`}
              book={b}
              showStars
            />
          ))}
        </div>
      </div>

      <div>
        <div className="section-label">Want to Read</div>
        <div className="book-grid">
          {wantToReadCapped.map((b, i) => (
            <BookCard key={b.guid ?? `${b.title}-${i}`} book={b} />
          ))}
        </div>
      </div>
    </div>
  );
}
