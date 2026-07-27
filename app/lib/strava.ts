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

export interface GolfPhoto {
  id: string;
  url: string;
  width?: number;
  height?: number;
  caption?: string;
}

export interface GolfRound {
  id: number;
  /** The activity title, which is always the course the round was played at. */
  location: string;
  startDateLocal: string;
  movingTimeSeconds: number;
  elapsedTimeSeconds: number;
  distanceMeters: number;
  photos: GolfPhoto[];
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
  photos?: {
    primary?: { unique_id?: string; urls?: Record<string, string> } | null;
    count?: number;
  };
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

// One page of activities backs every section that reads from Strava. Golf
// rounds are sparse compared to runs, so the page has to be wide enough that a
// few of them survive filtering. Identical requests are deduped by the fetch
// cache, so the extra callers cost nothing.
const ACTIVITY_PAGE_SIZE = 100;

async function fetchRecentActivities(): Promise<StravaActivity[]> {
  const accessToken = await getAccessToken();
  if (!accessToken) return [];

  const res = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?per_page=${ACTIVITY_PAGE_SIZE}`,
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

  return (await res.json()) as StravaActivity[];
}

function isSport(activity: StravaActivity, sport: string): boolean {
  return activity.sport_type === sport || activity.type === sport;
}

export async function fetchRuns(limit = 10): Promise<Run[]> {
  try {
    const activities = await fetchRecentActivities();
    return activities
      .filter((a) => isSport(a, "Run"))
      .slice(0, limit)
      .map(normalize);
  } catch (err) {
    console.warn(
      `Strava fetchRuns error: ${err instanceof Error ? err.message : String(err)}`
    );
    return [];
  }
}

// Strava serves photos at a handful of fixed widths; ask for one large enough
// to survive the image optimizer resizing it back down.
const PHOTO_SIZE = 1024;

type StravaPhoto = {
  unique_id?: string;
  caption?: string;
  urls?: Record<string, string>;
  sizes?: Record<string, [number, number]>;
};

function toGolfPhoto(photo: StravaPhoto, index: number): GolfPhoto | null {
  const urls = photo.urls ?? {};
  // Keys are pixel widths as strings ("600", "1024"); take the largest served.
  const widest = Object.keys(urls)
    .map(Number)
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => b - a)[0];

  const key = widest === undefined ? Object.keys(urls)[0] : String(widest);
  const url = key ? urls[key] : undefined;
  if (!url) return null;

  const dimensions = key ? photo.sizes?.[key] : undefined;

  return {
    id: photo.unique_id || `${index}-${url}`,
    url,
    width: dimensions?.[0],
    height: dimensions?.[1],
    caption: photo.caption || undefined,
  };
}

/**
 * The summary activity only ever carries the primary photo — used as a fallback
 * when the per-activity photo endpoint is unavailable.
 */
function primaryPhoto(activity: StravaActivity): GolfPhoto[] {
  const primary = activity.photos?.primary;
  if (!primary) return [];
  const photo = toGolfPhoto(
    { unique_id: primary.unique_id, urls: primary.urls },
    0
  );
  return photo ? [photo] : [];
}

async function fetchActivityPhotos(
  activity: StravaActivity
): Promise<GolfPhoto[]> {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return primaryPhoto(activity);

    const res = await fetch(
      `https://www.strava.com/api/v3/activities/${activity.id}/photos?size=${PHOTO_SIZE}&photo_sources=true`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      console.warn(
        `Strava photos fetch failed for activity ${activity.id}: ${res.status} ${res.statusText}`
      );
      return primaryPhoto(activity);
    }

    const photos = (await res.json()) as StravaPhoto[];
    const mapped = photos
      .map(toGolfPhoto)
      .filter((p): p is GolfPhoto => p !== null);

    return mapped.length > 0 ? mapped : primaryPhoto(activity);
  } catch (err) {
    console.warn(
      `Strava photos error for activity ${activity.id}: ${err instanceof Error ? err.message : String(err)}`
    );
    return primaryPhoto(activity);
  }
}

export async function fetchGolfRounds(limit = 6): Promise<GolfRound[]> {
  try {
    const activities = await fetchRecentActivities();
    const rounds = activities.filter((a) => isSport(a, "Golf")).slice(0, limit);

    return await Promise.all(
      rounds.map(async (activity) => ({
        id: activity.id as number,
        location: (activity.name as string) || "Untitled round",
        startDateLocal: activity.start_date_local as string,
        movingTimeSeconds: (activity.moving_time as number) ?? 0,
        elapsedTimeSeconds: (activity.elapsed_time as number) ?? 0,
        distanceMeters: (activity.distance as number) ?? 0,
        photos: await fetchActivityPhotos(activity),
      }))
    );
  } catch (err) {
    console.warn(
      `Strava fetchGolfRounds error: ${err instanceof Error ? err.message : String(err)}`
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
