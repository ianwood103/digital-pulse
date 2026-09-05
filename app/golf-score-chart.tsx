import type { GolfRound } from "./lib/strava";

function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function GolfScoreChart({
  course,
  rounds,
}: {
  course: string;
  rounds: GolfRound[];
}) {
  const points = rounds
    .filter((r) => typeof r.grossScore === "number")
    .map((r) => ({
      id: r.id,
      score: r.grossScore as number,
      date: r.startDateLocal,
    }))
    // Chronological for the line (oldest → newest)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (points.length === 0) return null;

  const width = 640;
  const height = 220;
  const pad = { top: 28, right: 20, bottom: 36, left: 40 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const scores = points.map((p) => p.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  // Keep enough headroom that a lone score (e.g. 118) doesn't collapse the
  // axis to 116–120 and sit on top of the middle tick — that reads as if the
  // score were skipped. Aim for ~10 strokes of padding and nice step marks.
  const rawPad = Math.max(10, Math.ceil((maxScore - minScore) * 0.25));
  const yMin = Math.max(0, Math.floor((minScore - rawPad) / 5) * 5);
  const yMax = Math.ceil((maxScore + rawPad) / 5) * 5;
  const yRange = Math.max(yMax - yMin, 5);

  const xFor = (index: number) =>
    pad.left +
    (points.length === 1
      ? innerW / 2
      : (index / (points.length - 1)) * innerW);
  const yFor = (score: number) =>
    pad.top + ((yMax - score) / yRange) * innerH;

  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(p.score)}`)
    .join(" ");

  // Prefer ~4 evenly spaced ticks on a 5-stroke grid; always include ends.
  const step = Math.max(5, Math.ceil(yRange / 3 / 5) * 5);
  const ticks: number[] = [];
  for (let t = yMin; t <= yMax; t += step) ticks.push(t);
  if (ticks[ticks.length - 1] !== yMax) ticks.push(yMax);

  const latest = points[points.length - 1];

  return (
    <div
      className="golf-score-chart"
      aria-label={`Gross score over time at ${course}`}
    >
      <div className="golf-score-chart-head">
        <div className="golf-score-chart-title">{course}</div>
        <div className="golf-score-chart-sub">
          {points.length} round{points.length === 1 ? "" : "s"}
          {latest ? ` · latest ${latest.score}` : ""}
        </div>
      </div>
      <svg
        className="golf-score-chart-svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={pad.left}
              x2={width - pad.right}
              y1={yFor(tick)}
              y2={yFor(tick)}
              className="golf-score-grid"
            />
            <text
              x={pad.left - 8}
              y={yFor(tick) + 3}
              textAnchor="end"
              className="golf-score-axis"
            >
              {tick}
            </text>
          </g>
        ))}

        {points.length > 1 && (
          <path d={line} className="golf-score-line" fill="none" />
        )}

        {points.map((p, i) => (
          <g key={p.id}>
            <circle
              cx={xFor(i)}
              cy={yFor(p.score)}
              r={5}
              className="golf-score-dot"
            >
              <title>
                {p.score} · {shortDate(p.date)}
              </title>
            </circle>
            <text
              x={xFor(i)}
              y={yFor(p.score) - 12}
              textAnchor="middle"
              className="golf-score-value"
            >
              {p.score}
            </text>
            <text
              x={xFor(i)}
              y={height - 12}
              textAnchor="middle"
              className="golf-score-axis"
            >
              {shortDate(p.date)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
