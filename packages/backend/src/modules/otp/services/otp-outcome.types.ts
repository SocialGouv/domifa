export type OtpOutcome =
  | { kind: "ok" }
  | { kind: "issued"; plainCode: string }
  | { kind: "already_active" }
  | { kind: "invalid"; attemptsRemaining: number }
  | { kind: "expired" }
  | { kind: "scope_locked"; retryAt: Date }
  | { kind: "user_rate_limited"; retryAt: Date };
