// Renders the audit log `context` JSON as a human-readable French line for the
// activity tab. The raw JSON is still shown alongside this line — this is just
// an at-a-glance summary so admins don't need to parse it manually.

const REQUEST_BLOCK_REASON_LABELS: Record<string, string> = {
  missing_ua: "user-agent absent",
  bot_ua: "user-agent identifié comme bot",
  invalid_origin: "origine/referer non autorisé",
};

const AUTO_BLOCK_REASON_LABELS: Record<string, string> = {
  throttle_authenticated: "trop de requêtes (compte authentifié)",
  throttle_targeted: "trop de tentatives sur ce compte",
  missing_ua: "user-agent absent",
  bot_ua: "user-agent identifié comme bot",
  invalid_origin: "origine/referer non autorisé",
};

const NON_ACTIVE_STATUS_LABELS: Record<string, string> = {
  PENDING: "compte en attente d'activation",
  TEMPORARILY_BLOCKED: "compte temporairement bloqué",
  BLOCKED: "compte bloqué",
};

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function pushIp(parts: string[], ctx: Record<string, unknown>): void {
  const ip = asString(ctx["ip"]);
  if (ip) {
    parts.push(`IP : ${ip}`);
  }
}

function pushUserAgent(parts: string[], ctx: Record<string, unknown>): void {
  const ua = asString(ctx["userAgent"]);
  if (ua) {
    parts.push(`User-agent : ${ua}`);
  }
}

function pushHttpTarget(parts: string[], ctx: Record<string, unknown>): void {
  const method = asString(ctx["method"]);
  const url = asString(ctx["url"]);
  if (method && url) {
    parts.push(`${method} ${url}`);
  } else if (url) {
    parts.push(url);
  }
}

function formatThrottleWindow(ttlMs: number): string {
  if (ttlMs >= 60_000) {
    const minutes = Math.round(ttlMs / 60_000);
    return `${minutes} min`;
  }
  const seconds = Math.round(ttlMs / 1000);
  return `${seconds} s`;
}

function formatThrottleBlocked(ctx: Record<string, unknown>): string {
  const parts: string[] = ["Quota de requêtes dépassé"];
  const limit = asNumber(ctx["limit"]);
  const ttl = asNumber(ctx["ttl"]);
  if (limit && ttl) {
    parts.push(`limite : ${limit} req / ${formatThrottleWindow(ttl)}`);
  }
  pushIp(parts, ctx);
  pushUserAgent(parts, ctx);
  pushHttpTarget(parts, ctx);
  const attempted = asString(ctx["attemptedIdentifier"]);
  if (attempted) {
    parts.push(`identifiant tenté : ${attempted}`);
  }
  return parts.join(" · ");
}

function formatRequestBlocked(ctx: Record<string, unknown>): string {
  const reason = asString(ctx["reason"]);
  const reasonLabel = reason
    ? REQUEST_BLOCK_REASON_LABELS[reason] ?? reason
    : "raison non précisée";
  const parts: string[] = [`Requête bloquée — ${reasonLabel}`];
  const attempts = asNumber(ctx["attempts"]);
  if (attempts && attempts > 1) {
    parts.push(`${attempts} tentatives`);
  }
  pushIp(parts, ctx);
  pushUserAgent(parts, ctx);
  pushHttpTarget(parts, ctx);
  const origin = asString(ctx["origin"]);
  if (origin) {
    parts.push(`origin : ${origin}`);
  }
  const attempted = asString(ctx["attemptedIdentifier"]);
  if (attempted) {
    parts.push(`identifiant tenté : ${attempted}`);
  }
  return parts.join(" · ");
}

function formatBlockUser(ctx: Record<string, unknown>): string {
  const reason = asString(ctx["reason"]);
  const reasonLabel = reason
    ? AUTO_BLOCK_REASON_LABELS[reason] ?? reason
    : "raison non précisée";
  const parts: string[] = [`Blocage automatique — ${reasonLabel}`];

  // The throttle sub-context carries the IP/UA/URL captured at the moment of
  // the auto-block. Surface them so the admin sees the same details inline.
  const throttle = ctx["throttle"];
  if (throttle && typeof throttle === "object") {
    pushIp(parts, throttle as Record<string, unknown>);
    pushUserAgent(parts, throttle as Record<string, unknown>);
    pushHttpTarget(parts, throttle as Record<string, unknown>);
  } else {
    pushIp(parts, ctx);
    pushUserAgent(parts, ctx);
    pushHttpTarget(parts, ctx);
  }

  const attempted = asString(ctx["attemptedIdentifier"]);
  if (attempted) {
    parts.push(`identifiant tenté : ${attempted}`);
  }
  return parts.join(" · ");
}

function formatBlockUserByAdmin(ctx: Record<string, unknown>): string {
  const userId = asNumber(ctx["userId"]);
  const profile = asString(ctx["userProfile"]);
  const parts: string[] = ["Blocage manuel par un administrateur"];
  if (userId) {
    parts.push(`utilisateur #${userId}${profile ? ` (${profile})` : ""}`);
  }
  return parts.join(" · ");
}

function formatUnblockUser(ctx: Record<string, unknown>): string {
  const userId = asNumber(ctx["userId"]);
  const profile = asString(ctx["userProfile"]);
  const motif = asString(ctx["motif"]);
  const parts: string[] = ["Déblocage manuel par un administrateur"];
  if (userId) {
    parts.push(`utilisateur #${userId}${profile ? ` (${profile})` : ""}`);
  }
  if (motif) {
    parts.push(`motif : ${motif}`);
  }
  return parts.join(" · ");
}

function formatAccessDeniedNonActive(ctx: Record<string, unknown>): string {
  const status = asString(ctx["status"]);
  const statusLabel = status
    ? NON_ACTIVE_STATUS_LABELS[status] ?? status
    : "compte non actif";
  const parts: string[] = [`Accès refusé — ${statusLabel}`];
  pushIp(parts, ctx);
  pushUserAgent(parts, ctx);
  pushHttpTarget(parts, ctx);
  return parts.join(" · ");
}

export function getLogContextHumanSummary(
  action: string,
  context: unknown
): string {
  if (!context || typeof context !== "object") {
    return "";
  }
  const ctx = context as Record<string, unknown>;
  switch (action) {
    case "THROTTLE_BLOCKED":
      return formatThrottleBlocked(ctx);
    case "REQUEST_BLOCKED":
      return formatRequestBlocked(ctx);
    case "BLOCK_USER":
      return formatBlockUser(ctx);
    case "BLOCK_USER_BY_ADMIN":
      return formatBlockUserByAdmin(ctx);
    case "UNBLOCK_USER":
      return formatUnblockUser(ctx);
    case "ACCESS_DENIED_NON_ACTIVE":
      return formatAccessDeniedNonActive(ctx);
    default:
      return "";
  }
}

export function getLogContextJson(context: unknown): string {
  if (!context || typeof context !== "object") {
    return "";
  }
  try {
    return JSON.stringify(context, null, 2);
  } catch {
    return "";
  }
}
