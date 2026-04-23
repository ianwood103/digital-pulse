import { formatShortDate, metersToMiles, mpsToPaceString, secondsToClock } from "./lib/format";
import { polylineToSvg } from "./lib/polyline";
import { runMonthStats, type Run } from "./lib/strava";

function formatMonthPace(minutesPerMile: number): string {
  const totalSeconds = Math.round(minutesPerMile * 60);
  const min = Math.floor(totalSeconds / 60);
  const sec = totalSeconds % 60;
  return `${min}:${sec.toString().padStart(2, "0")}/mi`;
}

function formatTimeOnFeet(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export default function RunningSection({ runs }: { runs: Run[] }) {
  const stats = runMonthStats(runs);

  return (
    <>
      {runs.length === 0 && (
        <div className="setup-box">
          <p>Strava not connected — showing no data.</p>
          <p>
            To connect: set <code>STRAVA_CLIENT_ID</code>,{" "}
            <code>STRAVA_CLIENT_SECRET</code>, and{" "}
            <code>STRAVA_REFRESH_TOKEN</code> as environment variables.
          </p>
        </div>
      )}

      <div className="run-stats-bar">
        <div className="run-stat">
          <div className="run-stat-value">{stats.count}</div>
          <div className="run-stat-label">Runs this mo.</div>
        </div>
        <div className="run-stat">
          <div className="run-stat-value">{stats.miles.toFixed(1)}</div>
          <div className="run-stat-label">Miles this mo.</div>
        </div>
        <div className="run-stat">
          <div className="run-stat-value run-stat-value-pace">
            {stats.count > 0 ? formatMonthPace(stats.avgPaceMinPerMile) : "—"}
          </div>
          <div className="run-stat-label">Avg pace</div>
        </div>
        <div className="run-stat">
          <div className="run-stat-value">
            {stats.count > 0 ? formatTimeOnFeet(stats.totalSeconds) : "—"}
          </div>
          <div className="run-stat-label">Time on feet</div>
        </div>
      </div>

      <div className="run-list">
        {runs.map((run) => {
          const miles = metersToMiles(run.distanceMeters).toFixed(1);
          return (
            <div className="run-item" key={run.id}>
              <div className="run-main">
                <div
                  className="run-map-svg"
                  dangerouslySetInnerHTML={{
                    __html: polylineToSvg(run.summaryPolyline),
                  }}
                />
                <div className="run-copy">
                  <div className="run-name">{run.name}</div>
                  <div className="run-details">
                    <span>{miles} mi</span>
                    <span>{mpsToPaceString(run.averageSpeedMps)}</span>
                    <span>{secondsToClock(run.movingTimeSeconds)}</span>
                    {run.averageHeartrate && (
                      <span className="run-heart">
                        ♥ {Math.round(run.averageHeartrate)} bpm
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="run-right">
                <div className="run-date">{formatShortDate(run.startDateLocal)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
