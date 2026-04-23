import type { CSSProperties } from "react";
import type { ContributionYear, ContributionDay } from "./lib/github";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function buildColumns(days: ContributionDay[]): (ContributionDay | null)[][] {
  if (days.length === 0) return [];

  // Pad leading nulls so column 0 starts on Sunday
  const startDow = new Date(days[0].date + "T00:00:00").getDay();
  const padded: (ContributionDay | null)[] = [
    ...Array<null>(startDow).fill(null),
    ...days,
  ];

  const columns: (ContributionDay | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    const col = padded.slice(i, i + 7);
    while (col.length < 7) col.push(null);
    columns.push(col);
  }
  return columns;
}

interface MonthLabel {
  label: string;
  colSpan: number;
}

function buildMonthLabels(columns: (ContributionDay | null)[][]): MonthLabel[] {
  const labels: MonthLabel[] = [];
  let prevMonth: number | null = null;
  let current: MonthLabel | null = null;

  for (let i = 0; i < columns.length; i++) {
    const firstDay = columns[i].find((d) => d !== null);
    const month = firstDay
      ? new Date(firstDay.date + "T00:00:00").getMonth()
      : null;

    if (i === 0 || (month !== null && month !== prevMonth)) {
      if (current) labels.push(current);
      current = { label: month !== null ? MONTH_NAMES[month] : "", colSpan: 1 };
      if (month !== null) prevMonth = month;
    } else {
      if (current) current.colSpan++;
    }
  }

  if (current) labels.push(current);
  return labels;
}

export default function GithubGraph({ data }: { data: ContributionYear }) {
  const { days, total, streak } = data;
  const columns = buildColumns(days);
  const today = new Date().toISOString().slice(0, 10);
  const monthLabels = buildMonthLabels(columns);
  const graphStyle = {
    "--gh-columns": Math.max(columns.length, 1),
  } as CSSProperties;

  return (
    <div className="gh-wrap">
      <div className="gh-months" style={graphStyle}>
        {monthLabels.map((ml, i) => (
          <div
            key={i}
            className="gh-month-label"
            style={{ gridColumn: `span ${ml.colSpan}` }}
          >
            {ml.label}
          </div>
        ))}
      </div>
      <div className="gh-graph" style={graphStyle}>
        {columns.map((col, ci) => (
          <div key={ci} className="gh-col">
            {col.map((day, di) => {
              if (!day) {
                return (
                  <div key={di} className="gh-cell" style={{ opacity: 0 }} />
                );
              }
              return (
                <div
                  key={di}
                  className="gh-cell"
                  data-level={day.level}
                  title={`${day.date}: ${day.count} contributions`}
                  style={
                    day.date === today
                      ? { outline: "1px solid var(--blue-mid)" }
                      : undefined
                  }
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="gh-meta">
        <span>{total.toLocaleString()} contributions in the last year</span>
        <span>
          {streak > 0 && <>{streak}-day streak · </>}
          <a
            href="https://github.com/ianwood103"
            className="gh-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub ↗
          </a>
        </span>
      </div>
    </div>
  );
}
