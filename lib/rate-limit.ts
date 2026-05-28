import { prisma } from "./prisma";

export const DAILY_QUERY_LIMIT = 5;

type DailyQueryUsageResult = {
  allowed: boolean;
  remaining: number;
  queryCount: number;
  resetAt: Date;
};

function getRequestIp(request: Request): string | null {
  const headersToCheck = [
    "x-forwarded-for",
    "x-real-ip",
    "cf-connecting-ip",
    "true-client-ip",
  ];

  for (const headerName of headersToCheck) {
    const value = request.headers.get(headerName);
    if (!value) continue;

    const ip = value.split(",")[0]?.trim();
    if (ip) {
      return ip.startsWith("::ffff:") ? ip.slice(7) : ip;
    }
  }

  return null;
}

function getUtcDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getNextUtcMidnight(date: Date): Date {
  const nextMidnight = new Date(date);
  nextMidnight.setUTCHours(24, 0, 0, 0);
  return nextMidnight;
}

export async function consumeDailyQueryQuota(
  request: Request,
  routeName: string,
): Promise<DailyQueryUsageResult> {
  const now = new Date();
  const ipAddress = getRequestIp(request) ?? "unknown";
  const dayKey = getUtcDayKey(now);
  const userAgent = request.headers.get("user-agent");

  const usage = await prisma.dailyQueryUsage.upsert({
    where: {
      ipAddress_dayKey: {
        ipAddress,
        dayKey,
      },
    },
    create: {
      ipAddress,
      dayKey,
      queryCount: 1,
      lastRoute: routeName,
      userAgent,
    },
    update: {
      queryCount: {
        increment: 1,
      },
      lastRoute: routeName,
      userAgent,
    },
    select: {
      queryCount: true,
    },
  });

  return {
    allowed: usage.queryCount <= DAILY_QUERY_LIMIT,
    remaining: Math.max(DAILY_QUERY_LIMIT - usage.queryCount, 0),
    queryCount: usage.queryCount,
    resetAt: getNextUtcMidnight(now),
  };
}
