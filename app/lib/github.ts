export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionYear {
  days: ContributionDay[];
  total: number;
  streak: number;
}

interface ApiContribution {
  date: string;
  count: number;
  level: number;
}

interface ApiResponse {
  contributions: ApiContribution[];
  total: Record<string, number>;
}

export async function fetchContributionYear(username: string): Promise<ContributionYear> {
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${username}?y=last`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      return { days: [], total: 0, streak: 0 };
    }

    const data = (await res.json()) as ApiResponse;
    const days: ContributionDay[] = (data.contributions ?? []).map((d) => ({
      date: d.date,
      count: d.count,
      level: Math.min(4, Math.max(0, d.level)) as 0 | 1 | 2 | 3 | 4,
    }));

    const total =
      typeof data.total?.lastYear === "number"
        ? data.total.lastYear
        : days.reduce((sum, d) => sum + d.count, 0);

    // Iterate newest-first, count consecutive days with count > 0
    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0) {
        streak++;
      } else {
        break;
      }
    }

    return { days, total, streak };
  } catch {
    return { days: [], total: 0, streak: 0 };
  }
}
