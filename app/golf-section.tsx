import Image from "next/image";
import { formatLongDate, metersToMiles } from "./lib/format";
import type { GolfRound } from "./lib/strava";

function formatTimeOnCourse(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export default function GolfSection({ rounds }: { rounds: GolfRound[] }) {
  if (rounds.length === 0) {
    return (
      <p className="section-msg">No golf rounds logged on Strava yet.</p>
    );
  }

  return (
    <div className="golf-list">
      {rounds.map((round) => {
        const seconds = round.movingTimeSeconds || round.elapsedTimeSeconds;
        const miles = metersToMiles(round.distanceMeters);

        return (
          <article className="golf-round" key={round.id}>
            <div className="golf-round-head">
              <a
                className="golf-course"
                href={`https://www.strava.com/activities/${round.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {round.location}
              </a>
              <div className="golf-meta">
                <span>{formatLongDate(round.startDateLocal)}</span>
                {seconds > 0 && <span>{formatTimeOnCourse(seconds)}</span>}
                {miles >= 0.1 && <span>{miles.toFixed(1)} mi walked</span>}
              </div>
            </div>

            {round.photos.length > 0 && (
              <div
                className="golf-photos"
                data-count={Math.min(round.photos.length, 3)}
              >
                {round.photos.map((photo) => (
                  <figure className="golf-photo" key={photo.id}>
                    <Image
                      src={photo.url}
                      alt={photo.caption || `Photo from ${round.location}`}
                      fill
                      sizes="(max-width: 900px) 100vw, 340px"
                      className="golf-photo-img"
                    />
                  </figure>
                ))}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
