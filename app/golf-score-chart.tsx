import type { GolfRound } from "./lib/strava";

function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function GolfScoreChart({ rounds }: { rounds: GolfRound[] }) {
  const points = rounds
    .filter((r) => typeof r.grossScore === "number")
    .map((r) => ({
      id: r.id,
      score: r.grossScore as number,
      date: r.startDateLocal,
      course: r.location,
    }))
    // Chronological for the line (oldest → newest)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (points.length === 0) return null;

  const width = 640;
  const height = 220;
  const pad = { top: 24, right: 20, bottom: 36, left: 40 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const scores = points.map((p) => p.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const span = Math.max(maxScore - minScore, 8);
  const yMin = Math.max(0, Math.floor((minScore - span * 0.2) / 2) * 2);
  const yMax = Math.ceil((maxScore + span * 0.2) / 2) * 2;

  const xFor = (index: number) =>
    pad.left +
    (points.length === 1
      ? innerW / 2
      : (index / (points.length - 1)) * innerW);
  const yFor = (score: number) =>
    pad.top + ((yMax - score) / (yMax - yMin)) * innerH;

  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(p.score)}`)
    .join(" ");

  const ticks = [yMin, Math.round((yMin + yMax) / 2), yMax];

  return (
    <div className="golf-score-chart" aria-label="Gross score over time">
      <div className="golf-score-chart-head">
        <div className="golf-score-chart-title">Score over time</div>
        <div className="golf-score-chart-sub">
          Gross score from OCR&apos;d scorecards
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

        <path d={line} className="golf-score-line" fill="none" />

        {points.map((p, i) => (
          <g key={p.id}>
            <circle
              cx={xFor(i)}
              cy={yFor(p.score)}
              r={4.5}
              className="golf-score-dot"
            >
              <title>
                {p.score} · {p.course} · {shortDate(p.date)}
              </title>
            </circle>
            <text
              x={xFor(i)}
              y={yFor(p.score) - 10}
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
