"use client";

interface MovieItem {
  title: string;
  year?: string;
  rating?: number;
  watchedDate?: string;
  rewatch: boolean;
  posterUrl?: string;
  link?: string;
  guid?: string;
}

interface FilmShelfProps {
  recent: MovieItem[];
  watchedThisYear: MovieItem[];
  year: number;
}

const stars = (n: number) => {
  const clamped = Math.max(0, Math.min(5, n));
  const full = Math.floor(clamped);
  const half = clamped - full >= 0.5;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(5 - full - (half ? 1 : 0));
};

const watchedOn = (iso?: string) => {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
};

function Poster({ movie, className }: { movie: MovieItem; className?: string }) {
  if (!movie.posterUrl) {
    return <div className="film-no-poster">{movie.title}</div>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={movie.posterUrl}
      alt={movie.title}
      className={className}
      loading="lazy"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = "none";
      }}
    />
  );
}

function LastWatchedHero({ movie }: { movie: MovieItem }) {
  const date = watchedOn(movie.watchedDate);
  const inner = (
    <>
      <Poster movie={movie} className="film-poster" />
      <div>
        <div
          className="book-status-pill"
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <span className="pulse-dot film" />
          Last watched
        </div>
        <div className="film-title">
          {movie.title}
          {movie.year && <span className="film-year">{movie.year}</span>}
        </div>
        {movie.rating !== undefined && (
          <span className="book-stars">{stars(movie.rating)}</span>
        )}
        {(date || movie.rewatch) && (
          <div className="film-meta">
            {date}
            {date && movie.rewatch ? " · " : ""}
            {movie.rewatch ? "Rewatch" : ""}
          </div>
        )}
      </div>
    </>
  );

  if (movie.link) {
    return (
      <a
        href={movie.link}
        className="film-current"
        target="_blank"
        rel="noopener noreferrer"
      >
        {inner}
      </a>
    );
  }
  return <div className="film-current">{inner}</div>;
}

function FilmThumb({ movie }: { movie: MovieItem }) {
  const inner = (
    <>
      <Poster movie={movie} />
      <div className="film-thumb-title">{movie.title}</div>
      {movie.year && <div className="film-thumb-year">{movie.year}</div>}
      {movie.rating !== undefined && (
        <span className="book-stars">{stars(movie.rating)}</span>
      )}
    </>
  );

  if (movie.link) {
    return (
      <a
        href={movie.link}
        className="film-thumb"
        target="_blank"
        rel="noopener noreferrer"
      >
        {inner}
      </a>
    );
  }
  return <div className="film-thumb">{inner}</div>;
}

export default function FilmShelf({
  recent,
  watchedThisYear,
  year,
}: FilmShelfProps) {
  if (recent.length === 0) {
    return <p className="empty-post">No films logged yet.</p>;
  }

  const [latest, ...rest] = recent;
  // Prefer the current year's diary when there is one, otherwise just show
  // whatever the feed still carries — it only holds the 50 most recent entries.
  const grid = (watchedThisYear.length > 1 ? watchedThisYear.slice(1) : rest).slice(
    0,
    24
  );

  return (
    <div>
      <div className="current-films">
        <LastWatchedHero movie={latest} />
      </div>

      {grid.length > 0 && (
        <div>
          <div className="shelf-label">
            {watchedThisYear.length > 1
              ? `Also watched in ${year}`
              : "Recently watched"}
          </div>
          <div className="films-grid">
            {grid.map((movie, i) => (
              <FilmThumb
                key={movie.guid ?? `${movie.title}-${i}`}
                movie={movie}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
