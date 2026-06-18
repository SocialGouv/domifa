// Source unique des tiers throttler — utilisé par ThrottlerModule et par
// le ban IP. ipBanDurationMs : number = ban temporaire, null = permanent.
type AppThrottlerTier = {
  readonly name: string;
  readonly ttl: number;
  readonly limit: number;
  readonly blockDuration: number;
  readonly ipBanDurationMs: number | null;
};

export const APP_THROTTLER_TIERS: readonly AppThrottlerTier[] = [
  // 13 req/s — throttle 30min, IP ban 30min
  {
    name: "short",
    ttl: 1_000,
    limit: 13,
    blockDuration: 1_800_000,
    ipBanDurationMs: 1_800_000,
  },
  // 113 req/min — throttle 1h, IP ban permanent
  {
    name: "medium",
    ttl: 60_000,
    limit: 113,
    blockDuration: 3_600_000,
    ipBanDurationMs: null,
  },
  // 5000 req/h — attrape l'énumération lente qui reste sous medium.
  // Plafond dur : doit être < medium.limit * 60 = 6780, sinon inatteignable.
  {
    name: "long",
    ttl: 3_600_000,
    limit: 5_000,
    blockDuration: 7_200_000,
    ipBanDurationMs: null,
  },
] as const;

// Returns the ban policy for the throttler tier matching the given ttl. The
// throttler exposes `ttl` (not the tier name) on its limit-detail payload, so
// we match by ttl to recover the tier. Unknown ttl falls through to permanent
// (fail-safe).
export function getIpBanPolicyForTtl(ttl: number): {
  tierName: string;
  expiresAt: Date | null;
} {
  const tier = APP_THROTTLER_TIERS.find((t) => t.ttl === ttl);
  if (!tier) {
    return { tierName: "unknown", expiresAt: null };
  }
  const expiresAt =
    tier.ipBanDurationMs == null
      ? null
      : new Date(Date.now() + tier.ipBanDurationMs);
  return { tierName: tier.name, expiresAt };
}
