export interface Run {
  id: number;
  name: string;
  distanceMeters: number;
  movingTimeSeconds: number;
  averageSpeedMps: number;
  averageHeartrate?: number;
  startDateLocal: string;
  summaryPolyline?: string;
}

export interface MonthStats {
  count: number;
  miles: number;
  avgPaceMinPerMile: number;
  totalSeconds: number;
}

interface TokenCache {
  accessToken: string;
  expiresAt: number;
  refreshToken: string;
}

let tokenCache: TokenCache | null = null;

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  // Reuse cached token if still valid (60s buffer)
  if (
    tokenCache &&
    tokenCache.refreshToken === refreshToken &&
    tokenCache.expiresAt > Date.now() / 1000 + 60
  ) {
    return tokenCache.accessToken;
  }

  try {
    const res = await fetch("https://www.strava.com/api/v3/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`Strava token refresh failed: ${res.status} ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    tokenCache = {
      accessToken: data.access_token as string,
      expiresAt: data.expires_at as number,
      refreshToken,
    };
    return tokenCache.accessToken;
  } catch (err) {
    console.warn(
      `Strava token refresh error: ${err instanceof Error ? err.message : String(err)}`
    );
    return null;
  }
}

type StravaActivity = Record<string, unknown> & {
  map?: { summary_polyline?: string };
};

function normalize(activity: StravaActivity): Run {
  return {
    id: activity.id as number,
    name: activity.name as string,
    distanceMeters: activity.distance as number,
    movingTimeSeconds: activity.moving_time as number,
    averageSpeedMps: activity.average_speed as number,
    averageHeartrate: activity.average_heartrate as number | undefined,
    startDateLocal: activity.start_date_local as string,
    summaryPolyline: activity.map?.summary_polyline,
  };
}

export async function fetchRuns(limit = 10): Promise<Run[]> {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return [];

    const res = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?per_page=${limit}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        next: { revalidate: 900 },
      }
    );

    if (!res.ok) {
      console.warn(
        `Strava activities fetch failed: ${res.status} ${res.statusText}`
      );
      return [];
    }

    const activities = (await res.json()) as StravaActivity[];
    return activities
      .filter((a) => a.type === "Run" || a.sport_type === "Run")
      .slice(0, limit)
      .map(normalize);
  } catch (err) {
    console.warn(
      `Strava fetchRuns error: ${err instanceof Error ? err.message : String(err)}`
    );
    return [];
  }
}

const METERS_PER_MILE = 1609.344;

export function runMonthStats(runs: Run[]): MonthStats {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthRuns = runs.filter(
    (r) => new Date(r.startDateLocal) >= monthStart
  );

  if (monthRuns.length === 0) {
    return { count: 0, miles: 0, avgPaceMinPerMile: 0, totalSeconds: 0 };
  }

  const totalMeters = monthRuns.reduce((sum, r) => sum + r.distanceMeters, 0);
  const totalSeconds = monthRuns.reduce(
    (sum, r) => sum + r.movingTimeSeconds,
    0
  );
  const miles = totalMeters / METERS_PER_MILE;
  const avgPaceMinPerMile = miles > 0 ? totalSeconds / 60 / miles : 0;

  return { count: monthRuns.length, miles, avgPaceMinPerMile, totalSeconds };
}
