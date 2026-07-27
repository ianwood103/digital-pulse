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
              <div className="golf-photos">
                {round.photos.map((photo) => (
                  <figure
                    className="golf-photo"
                    key={photo.id}
                    // These are generated scorecards, so the frame has to match
                    // the photo rather than the other way round — anything
                    // cropped is a number you can no longer read.
                    style={
                      photo.width && photo.height
                        ? { aspectRatio: `${photo.width} / ${photo.height}` }
                        : undefined
                    }
                  >
                    <Image
                      src={photo.url}
                      alt={photo.caption || `Photo from ${round.location}`}
                      fill
                      sizes="(max-width: 900px) 45vw, 240px"
                      className="golf-photo-img"
                      // Strava already serves these from its CDN at the width
                      // we ask for, so routing them back through the image
                      // optimizer buys nothing — and doing so means every CDN
                      // hostname Strava uses has to be allowlisted up front.
                      unoptimized
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
