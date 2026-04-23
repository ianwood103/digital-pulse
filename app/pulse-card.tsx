import Link from "next/link";
import {
  formatLongDate,
  formatShortDate,
  metersToMiles,
  mpsToPaceString,
} from "./lib/format";
import type { BookItem } from "./lib/books";
import type { Post } from "./lib/posts";
import type { Run } from "./lib/strava";

type PulseCardProps =
  | { kind: "run"; run?: Run }
  | { kind: "reading"; book?: BookItem }
  | { kind: "post"; post?: Post };

function PulseLabel({
  color,
  children,
}: {
  color?: "orange" | "green";
  children: React.ReactNode;
}) {
  return (
    <div className="pulse-card-label">
      <span className={["pulse-dot", color].filter(Boolean).join(" ")} />
      {children}
    </div>
  );
}

export default function PulseCard(props: PulseCardProps) {
  if (props.kind === "run") {
    const run = props.run;

    return (
      <a href="#running" className="pulse-card" id="pcRun">
        <PulseLabel color="orange">Last Run</PulseLabel>
        {run ? (
          <>
            <div className="pulse-card-title">
              {metersToMiles(run.distanceMeters).toFixed(1)} mi ·{" "}
              {mpsToPaceString(run.averageSpeedMps)}
            </div>
            <div className="pulse-card-meta">
              {run.name}
              <br />
              {formatShortDate(run.startDateLocal)}
            </div>
          </>
        ) : (
          <div className="pulse-skeleton">—</div>
        )}
      </a>
    );
  }

  if (props.kind === "reading") {
    const book = props.book;

    return (
      <a href="#reading" className="pulse-card" id="pcRead">
        <PulseLabel color="green">Reading</PulseLabel>
        <div className="pulse-card-title">{book?.title || "—"}</div>
        {book?.author_name && (
          <div className="pulse-card-meta">{book.author_name}</div>
        )}
      </a>
    );
  }

  const post = props.post;

  if (!post) {
    return (
      <a href="#writing" className="pulse-card" id="pcPost">
        <PulseLabel>Latest Post</PulseLabel>
        <div className="pulse-card-title">—</div>
      </a>
    );
  }

  return (
    <Link href={`/posts/${post.slug}`} className="pulse-card" id="pcPost">
      <PulseLabel>Latest Post</PulseLabel>
      <div className="pulse-card-title">{post.title}</div>
      <div className="pulse-card-meta">{formatLongDate(post.date)}</div>
    </Link>
  );
}
