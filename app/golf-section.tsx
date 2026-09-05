import GolfScoreChart from "./golf-score-chart";
import type { GolfRound } from "./lib/strava";

function normalizeCourse(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

function groupByCourse(rounds: GolfRound[]): { course: string; rounds: GolfRound[] }[] {
  const groups = new Map<string, GolfRound[]>();

  for (const round of rounds) {
    if (typeof round.grossScore !== "number") continue;
    const course = normalizeCourse(round.location) || "Unknown course";
    const key = course.toLowerCase();
    const existing = groups.get(key);
    if (existing) {
      existing.push(round);
    } else {
      groups.set(key, [round]);
    }
  }

  return [...groups.entries()]
    .map(([, courseRounds]) => ({
      course: normalizeCourse(courseRounds[0].location) || "Unknown course",
      rounds: courseRounds,
    }))
    // Most recently played course first
    .sort((a, b) => {
      const aLatest = Math.max(
        ...a.rounds.map((r) => new Date(r.startDateLocal).getTime())
      );
      const bLatest = Math.max(
        ...b.rounds.map((r) => new Date(r.startDateLocal).getTime())
      );
      return bLatest - aLatest;
    });
}

export default function GolfSection({ rounds }: { rounds: GolfRound[] }) {
  const courses = groupByCourse(rounds);

  if (courses.length === 0) {
    return (
      <p className="section-msg">
        No OCR&apos;d golf scores yet — scorecards attached to Strava rounds
        will show up here as per-course graphs.
      </p>
    );
  }

  return (
    <div className="golf-list">
      {courses.map(({ course, rounds: courseRounds }) => (
        <GolfScoreChart
          key={course.toLowerCase()}
          course={course}
          rounds={courseRounds}
        />
      ))}
    </div>
  );
}
