import { QuotaKind } from "../types/security-alert.types";

export type EnforceableQuotaKind = Extract<
  QuotaKind,
  "USAGERS_DOCS_DOWNLOAD" | "USAGERS_DELETE"
>;

export type QuotaEnforcementResult =
  | { allowed: true }
  | {
      allowed: false;
      // `true` only for the agent who actually crossed the threshold (i.e. the
      // call that produced the BLOCK_USER row). Subsequent calls from the same
      // structure return `false`: they are refused without re-blocking.
      blockedNow: boolean;
    };
