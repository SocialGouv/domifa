import { format } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { fr } from "date-fns/locale";

import {
  PermanentlyBlockedAccount,
  SecurityLogAction,
  SuspiciousActivitySummary,
} from "../types/security-alert.types";

const PARIS_TZ = "Europe/Paris";

const COLORS = {
  blueFrance: "#000091",
  blueLight: "#e3e3fd",
  redMarianne: "#ce0500",
  redLight: "#fee9e9",
  textPrimary: "#161616",
  textSecondary: "#666666",
  border: "#dddddd",
  background: "#ffffff",
  surfaceAlt: "#f6f6f6",
};

const FONT_STACK = "Marianne, Arial, Helvetica, sans-serif";

const formatParisDateTime = (date: Date): string =>
  format(utcToZonedTime(date, PARIS_TZ), "dd/MM/yyyy HH:mm:ss", { locale: fr });

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

// Reason codes emitted by AppThrottlerGuard / security pipeline.
// Anything not in this map falls back to the raw code so we never silently
// hide a new reason — operators will see the code and know to update this map.
const REASON_LABELS: Record<string, string> = {
  bot_ua: "User-Agent suspect (scanner/scraper detecte)",
  missing_ua: "User-Agent absent (requete non-navigateur)",
  invalid_origin: "Provenance non autorisee (Origin/Referer invalides)",
  throttle_authenticated:
    "Compte authentifie : trop de requetes en peu de temps",
  throttle_targeted:
    "Tentatives de connexion repetees sur ce compte depuis une meme IP (defense anti-bruteforce)",
  BLOCK_USER: "Compte bloque automatiquement",
  REQUEST_BLOCKED: "Requete rejetee (filtre bot ou origine)",
  THROTTLE_BLOCKED: "Quota de requetes depasse pour cette IP",
};

const ACTION_LABELS: Record<string, string> = {
  BLOCK_USER: "Comptes bloques automatiquement",
  REQUEST_BLOCKED: "Requetes rejetees (filtre bot ou origine)",
  THROTTLE_BLOCKED: "IP bloquees pour quota de requetes depasse",
};

const humanizeReason = (code: string | undefined): string => {
  if (!code) return "Motif non precise";
  return REASON_LABELS[code] ?? code;
};

const humanizeAction = (code: string): string => ACTION_LABELS[code] ?? code;

const cellStyle = `font-family: ${FONT_STACK}; font-size: 13px; color: ${COLORS.textPrimary}; padding: 8px 10px; border-bottom: 1px solid ${COLORS.border}; text-align: left; vertical-align: top;`;
const cellRightStyle = `${cellStyle} text-align: right;`;
const headerCellStyle = `font-family: ${FONT_STACK}; font-size: 12px; font-weight: 700; color: ${COLORS.textSecondary}; padding: 10px; border-bottom: 2px solid ${COLORS.blueFrance}; text-transform: uppercase; letter-spacing: 0.5px; text-align: left;`;
const headerCellRightStyle = `${headerCellStyle} text-align: right;`;
const emptyRowStyle = `font-family: ${FONT_STACK}; font-size: 13px; color: ${COLORS.textSecondary}; padding: 16px; text-align: center; font-style: italic;`;

function renderTotalsTable(totals: Record<SecurityLogAction, number>): string {
  const rows = (Object.keys(totals) as SecurityLogAction[])
    .map(
      (action) =>
        `<tr>
          <td style="${cellStyle}">
            <span style="color: ${COLORS.textPrimary};">${escapeHtml(
          humanizeAction(action)
        )}</span>
          </td>
          <td style="${cellRightStyle} font-weight: 700;">${totals[action]}</td>
        </tr>`
    )
    .join("");

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse; background-color: ${COLORS.background};">
    <thead>
      <tr>
        <th style="${headerCellStyle}">Type d'evenement</th>
        <th style="${headerCellRightStyle}">Occurrences</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

// Picks up to 2 concrete examples (1 user + 1 IP preferred, otherwise top 2
// from whichever side has data) so the reader can grasp the alert at a glance
// without scanning the full tables below.
function renderHighlights(summary: SuspiciousActivitySummary): string {
  const examples: string[] = [];

  if (summary.blockedUsers[0]) {
    examples.push(renderUserHighlight(summary.blockedUsers[0]));
  }
  if (summary.blockedIps[0]) {
    examples.push(renderIpHighlight(summary.blockedIps[0]));
  }
  if (examples.length < 2 && summary.blockedUsers[1]) {
    examples.push(renderUserHighlight(summary.blockedUsers[1]));
  }
  if (examples.length < 2 && summary.blockedIps[1]) {
    examples.push(renderIpHighlight(summary.blockedIps[1]));
  }

  if (examples.length === 0) return "";

  const cardStyle = `font-family: ${FONT_STACK}; font-size: 13px; color: ${COLORS.textPrimary}; padding: 12px 14px; background-color: ${COLORS.surfaceAlt}; border-left: 3px solid ${COLORS.redMarianne}; margin: 0 0 8px 0;`;

  return examples
    .map((html) => `<div style="${cardStyle}">${html}</div>`)
    .join("");
}

function renderStructureLabel(
  user: SuspiciousActivitySummary["blockedUsers"][0]
): string | null {
  if (user.structureId === undefined) {
    return null;
  }
  const namePart = user.structureName
    ? ` ${escapeHtml(user.structureName)}`
    : "";
  const cityPart = user.structureCity
    ? ` (${escapeHtml(user.structureCity)})`
    : "";
  return `Structure #${user.structureId}${namePart}${cityPart}`;
}

function renderUserHighlight(
  user: SuspiciousActivitySummary["blockedUsers"][0]
): string {
  const identity = [
    `<strong>Compte #${user.userId}</strong>`,
    user.email ? escapeHtml(user.email) : null,
  ]
    .filter(Boolean)
    .join(" - ");
  const meta = [
    user.userProfile ? `Profil : ${escapeHtml(user.userProfile)}` : null,
    user.role ? `Role : ${escapeHtml(user.role)}` : null,
    renderStructureLabel(user),
  ]
    .filter(Boolean)
    .join(" • ");

  return `
    <div style="font-size: 11px; font-weight: 700; color: ${
      COLORS.redMarianne
    }; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Compte bloque</div>
    <div style="font-size: 14px; margin-bottom: 4px;">${identity}</div>
    ${
      meta
        ? `<div style="color: ${COLORS.textSecondary}; font-size: 12px; margin-bottom: 4px;">${meta}</div>`
        : ""
    }
    <div>Motif : <strong>${escapeHtml(
      humanizeReason(user.reason)
    )}</strong></div>
    ${renderUserTriggerBlock(user)}
  `;
}

// Surfaces the trigger event (IP, URL, attempted identifier, quota) directly in
// the email so operators don't need to open app_log to understand "blocked by
// what?". Only renders when at least one trigger field is present.
function renderUserTriggerBlock(
  user: SuspiciousActivitySummary["blockedUsers"][0]
): string {
  const lines: string[] = [];

  if (user.triggerIp) {
    lines.push(
      `IP source : <strong style="font-family: monospace;">${escapeHtml(
        user.triggerIp
      )}</strong>`
    );
  }

  const urlLabel = [user.triggerMethod, user.triggerUrl ?? user.targetRoute]
    .filter(Boolean)
    .join(" ");
  if (urlLabel) {
    lines.push(
      `URL ciblee : <strong style="font-family: monospace;">${escapeHtml(
        urlLabel
      )}</strong>`
    );
  }

  if (
    user.attemptedIdentifier &&
    user.attemptedIdentifier.toLowerCase() !== (user.email ?? "").toLowerCase()
  ) {
    lines.push(
      `Identifiant tente : <strong style="font-family: monospace;">${escapeHtml(
        user.attemptedIdentifier
      )}</strong>`
    );
  }

  if (user.throttle) {
    lines.push(
      `Quota declencheur : <strong>${user.throttle.limit} requete${
        user.throttle.limit > 1 ? "s" : ""
      } / ${escapeHtml(user.throttle.windowLabel)}</strong>`
    );
  }

  if (lines.length === 0) return "";

  return `<div style="margin-top: 6px; color: ${
    COLORS.textPrimary
  }; font-size: 12px; line-height: 1.6;">${lines
    .map((line) => `<div>${line}</div>`)
    .join("")}</div>`;
}

function renderIpHighlight(
  ip: SuspiciousActivitySummary["blockedIps"][0]
): string {
  const reasons = ip.reasons.map(humanizeReason).join(", ");
  const throttleLine = ip.throttle
    ? `<div>Quota depasse : <strong>${ip.throttle.limit} requete${
        ip.throttle.limit > 1 ? "s" : ""
      } / ${escapeHtml(ip.throttle.windowLabel)}</strong></div>`
    : "";
  const identifiersLine = renderIdentifiersHighlight(ip);
  return `
    <div style="font-size: 11px; font-weight: 700; color: ${
      COLORS.redMarianne
    }; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">IP bloquee</div>
    <div style="font-size: 14px; margin-bottom: 4px;"><strong style="font-family: monospace;">${escapeHtml(
      ip.ip
    )}</strong> - <span style="color: ${
    COLORS.redMarianne
  }; font-weight: 700;">${ip.attempts} tentative${
    ip.attempts > 1 ? "s" : ""
  }</span></div>
    <div>Motif${ip.reasons.length > 1 ? "s" : ""} : <strong>${escapeHtml(
    reasons || humanizeReason(undefined)
  )}</strong></div>
    ${throttleLine}
    ${identifiersLine}
    ${
      ip.lastUrl
        ? `<div style="color: ${
            COLORS.textSecondary
          }; font-size: 12px; margin-top: 4px; font-family: monospace;">Derniere URL : ${escapeHtml(
            ip.lastUrl
          )}</div>`
        : ""
    }
  `;
}

function renderIdentifiersHighlight(
  ip: SuspiciousActivitySummary["blockedIps"][0]
): string {
  if (!ip.attemptedIdentifiers || ip.attemptedIdentifiers.length === 0) {
    return "";
  }
  const escaped = ip.attemptedIdentifiers.map(escapeHtml).join(", ");
  const overflow = ip.attemptedIdentifiersOverflow ?? 0;
  const overflowSuffix =
    overflow > 0
      ? ` <span style="color: ${COLORS.textSecondary};">(+${overflow} autre${
          overflow > 1 ? "s" : ""
        })</span>`
      : "";
  return `<div style="margin-top: 4px;">Identifiants tentes sur le login : <strong style="font-family: monospace;">${escaped}</strong>${overflowSuffix}</div>`;
}

function renderBlockedUsersTable(
  blockedUsers: SuspiciousActivitySummary["blockedUsers"]
): string {
  if (blockedUsers.length === 0) {
    return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse; background-color: ${COLORS.background};">
      <tr><td style="${emptyRowStyle}">Aucun compte bloque sur la periode</td></tr>
    </table>`;
  }

  const rows = blockedUsers
    .map(
      (user) =>
        `<tr>
          <td style="${cellStyle} font-weight: 700;">#${user.userId}</td>
          <td style="${cellStyle}">${escapeHtml(user.userProfile ?? "-")}</td>
          <td style="${cellStyle}">${escapeHtml(user.role ?? "-")}</td>
          <td style="${cellStyle}">${renderStructureCell(user)}</td>
          <td style="${cellStyle}">${escapeHtml(user.email ?? "-")}</td>
          <td style="${cellStyle}">${escapeHtml(
          humanizeReason(user.reason)
        )}</td>
          <td style="${cellStyle} font-size: 12px;">${renderUserTriggerCell(
          user
        )}</td>
        </tr>`
    )
    .join("");

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse; background-color: ${COLORS.background};">
    <thead>
      <tr>
        <th style="${headerCellStyle}">ID</th>
        <th style="${headerCellStyle}">Profil</th>
        <th style="${headerCellStyle}">Role</th>
        <th style="${headerCellStyle}">Structure</th>
        <th style="${headerCellStyle}">Email</th>
        <th style="${headerCellStyle}">Raison</th>
        <th style="${headerCellStyle}">Origine du blocage</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function renderUserTriggerCell(
  user: SuspiciousActivitySummary["blockedUsers"][0]
): string {
  const parts: string[] = [];

  if (user.triggerIp) {
    parts.push(
      `<div><span style="color: ${
        COLORS.textSecondary
      };">IP :</span> <span style="font-family: monospace; font-weight: 700;">${escapeHtml(
        user.triggerIp
      )}</span></div>`
    );
  }

  const urlLabel = [user.triggerMethod, user.triggerUrl ?? user.targetRoute]
    .filter(Boolean)
    .join(" ");
  if (urlLabel) {
    parts.push(
      `<div><span style="color: ${
        COLORS.textSecondary
      };">URL :</span> <span style="font-family: monospace;">${escapeHtml(
        urlLabel
      )}</span></div>`
    );
  }

  if (
    user.attemptedIdentifier &&
    user.attemptedIdentifier.toLowerCase() !== (user.email ?? "").toLowerCase()
  ) {
    parts.push(
      `<div><span style="color: ${
        COLORS.textSecondary
      };">Identifiant tente :</span> <span style="font-family: monospace;">${escapeHtml(
        user.attemptedIdentifier
      )}</span></div>`
    );
  }

  if (user.throttle) {
    parts.push(
      `<div><span style="color: ${
        COLORS.textSecondary
      };">Quota :</span> <strong>${user.throttle.limit} req / ${escapeHtml(
        user.throttle.windowLabel
      )}</strong></div>`
    );
  }

  return parts.length > 0 ? parts.join("") : "-";
}

function renderStructureCell(
  user: SuspiciousActivitySummary["blockedUsers"][0]
): string {
  if (user.structureId === undefined) {
    return "-";
  }
  const label = `#${user.structureId}`;
  if (!user.structureName && !user.structureCity) {
    return label;
  }
  const namePart = user.structureName
    ? `<div>${escapeHtml(user.structureName)}</div>`
    : "";
  const cityPart = user.structureCity
    ? `<div style="color: ${
        COLORS.textSecondary
      }; font-size: 12px;">${escapeHtml(user.structureCity)}</div>`
    : "";
  return `<div style="font-weight: 700;">${label}</div>${namePart}${cityPart}`;
}

function renderPermanentlyBlockedTable(
  accounts: PermanentlyBlockedAccount[]
): string {
  if (accounts.length === 0) {
    return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse; background-color: ${COLORS.background};">
      <tr><td style="${emptyRowStyle}">Aucun compte avec un statut BLOCKED en base</td></tr>
    </table>`;
  }

  const rows = accounts
    .map(
      (account) =>
        `<tr>
          <td style="${cellStyle} font-weight: 700;">#${account.userId}</td>
          <td style="${cellStyle}">${escapeHtml(account.userProfile)}</td>
          <td style="${cellStyle}">${escapeHtml(account.role ?? "-")}</td>
          <td style="${cellStyle}">${escapeHtml(account.email)}</td>
          <td style="${cellStyle}">${renderPermanentStructureCell(account)}</td>
        </tr>`
    )
    .join("");

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse; background-color: ${COLORS.background};">
    <thead>
      <tr>
        <th style="${headerCellStyle}">ID</th>
        <th style="${headerCellStyle}">Profil</th>
        <th style="${headerCellStyle}">Role</th>
        <th style="${headerCellStyle}">Email</th>
        <th style="${headerCellStyle}">Structure</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function renderPermanentStructureCell(
  account: PermanentlyBlockedAccount
): string {
  if (account.structureId === undefined) {
    return "-";
  }
  const label = `#${account.structureId}`;
  if (!account.structureName && !account.structureCity) {
    return label;
  }
  const namePart = account.structureName
    ? `<div>${escapeHtml(account.structureName)}</div>`
    : "";
  const cityPart = account.structureCity
    ? `<div style="color: ${
        COLORS.textSecondary
      }; font-size: 12px;">${escapeHtml(account.structureCity)}</div>`
    : "";
  return `<div style="font-weight: 700;">${label}</div>${namePart}${cityPart}`;
}

function renderBlockedIpsTable(
  blockedIps: SuspiciousActivitySummary["blockedIps"]
): string {
  if (blockedIps.length === 0) {
    return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse; background-color: ${COLORS.background};">
      <tr><td style="${emptyRowStyle}">Aucune IP bloquee sur la periode</td></tr>
    </table>`;
  }

  const rows = blockedIps
    .map(
      (ip) =>
        `<tr>
          <td style="${cellStyle} font-family: monospace; font-weight: 700;">${escapeHtml(
          ip.ip
        )}</td>
          <td style="${cellRightStyle} font-weight: 700; color: ${
          COLORS.redMarianne
        };">${ip.attempts}</td>
          <td style="${cellStyle}">${escapeHtml(
          ip.reasons.map(humanizeReason).join(", ")
        )}</td>
          <td style="${cellStyle}">${
          ip.throttle
            ? `<strong>${ip.throttle.limit} req/${escapeHtml(
                ip.throttle.windowLabel
              )}</strong>`
            : "-"
        }</td>
          <td style="${cellStyle} font-family: monospace; font-size: 12px;">${renderIdentifiersCell(
          ip
        )}</td>
          <td style="${cellStyle} font-family: monospace; font-size: 12px; color: ${
          COLORS.textSecondary
        };">${escapeHtml(ip.lastUrl ?? "-")}</td>
        </tr>`
    )
    .join("");

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse; background-color: ${COLORS.background};">
    <thead>
      <tr>
        <th style="${headerCellStyle}">IP</th>
        <th style="${headerCellRightStyle}">Tentatives</th>
        <th style="${headerCellStyle}">Motifs</th>
        <th style="${headerCellStyle}">Quota depasse</th>
        <th style="${headerCellStyle}">Identifiants tentes (login)</th>
        <th style="${headerCellStyle}">Derniere URL</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function renderIdentifiersCell(
  ip: SuspiciousActivitySummary["blockedIps"][0]
): string {
  if (!ip.attemptedIdentifiers || ip.attemptedIdentifiers.length === 0) {
    return "-";
  }
  const list = ip.attemptedIdentifiers.map(escapeHtml).join(", ");
  const overflow = ip.attemptedIdentifiersOverflow ?? 0;
  return overflow > 0 ? `${list} (+${overflow})` : list;
}

export function generateSecurityAlertEmailHtml(
  summary: SuspiciousActivitySummary,
  envId: string
): string {
  const {
    windowStart,
    windowEnd,
    totals,
    blockedUsers,
    blockedIps,
    permanentlyBlockedAccounts,
  } = summary;
  const sectionTitleStyle = `font-family: ${FONT_STACK}; font-size: 16px; font-weight: 700; color: ${COLORS.blueFrance}; margin: 0 0 12px 0;`;
  const bodyTextStyle = `font-family: ${FONT_STACK}; font-size: 14px; line-height: 1.5; color: ${COLORS.textPrimary}; margin: 0 0 12px 0;`;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Alerte securite DomiFa</title>
  <style type="text/css">
    body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: ${
      COLORS.surfaceAlt
    }; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { outline: none; text-decoration: none; border: none; -ms-interpolation-mode: bicubic; }
  </style>
</head>
<body bgcolor="${
    COLORS.surfaceAlt
  }" style="margin: 0; padding: 0; background-color: ${COLORS.surfaceAlt};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${
    COLORS.surfaceAlt
  };">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" style="max-width: 640px; width: 100%; background-color: ${
          COLORS.background
        };">

          <!-- Header logos -->
          <tr>
            <td style="padding: 20px 24px 12px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="50%" valign="middle" style="text-align: left;">
                    <img src="https://domifa.fabrique.social.gouv.fr/assets/images/discover/partenaire-mtssf.svg" alt="Ministere du Travail, de la Sante, des Solidarites et des Familles" width="100" style="display: block; width: 100px; height: auto;"/>
                  </td>
                  <td width="50%" valign="middle" style="text-align: right;">
                    <img src="https://domifa.fabrique.social.gouv.fr/assets/images/logo.png" alt="DomiFa" width="140" style="display: block; width: 140px; height: auto; margin-left: auto;"/>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Alert banner -->
          <tr>
            <td style="padding: 0 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${
                COLORS.redLight
              }; border-left: 4px solid ${COLORS.redMarianne};">
                <tr>
                  <td valign="middle" style="padding: 20px 24px;">
                    <p style="margin: 0; font-family: ${FONT_STACK}; font-size: 12px; font-weight: 700; color: ${
    COLORS.redMarianne
  }; text-transform: uppercase; letter-spacing: 1px;">
                      Alerte securite
                    </p>
                    <h1 style="margin: 6px 0 0 0; font-family: ${FONT_STACK}; font-size: 22px; font-weight: 700; line-height: 1.3; color: ${
    COLORS.textPrimary
  };">
                      Activite suspecte detectee
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Period -->
          <tr>
            <td style="padding: 20px 24px 0 24px;">
              <p style="${bodyTextStyle}">
                Des activites suspectes ont ete detectees sur la plateforme DomiFa.
              </p>
              <p style="${bodyTextStyle}">
                <strong>Environnement :</strong> <span style="display: inline-block; padding: 2px 8px; background-color: ${
                  COLORS.blueLight
                }; color: ${
    COLORS.blueFrance
  }; border-radius: 3px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">${escapeHtml(
    envId
  )}</span>
              </p>
              <p style="${bodyTextStyle}">
                <strong>Periode analysee :</strong> du ${formatParisDateTime(
                  windowStart
                )} au ${formatParisDateTime(windowEnd)} <span style="color: ${
    COLORS.textSecondary
  };">(${PARIS_TZ})</span>
              </p>
            </td>
          </tr>

          <!-- Highlights: up to 2 concrete examples -->
          ${
            blockedUsers.length > 0 || blockedIps.length > 0
              ? `<tr>
            <td style="padding: 16px 24px 0 24px;">
              <h2 style="${sectionTitleStyle}">Exemples</h2>
              ${renderHighlights(summary)}
            </td>
          </tr>`
              : ""
          }

          <!-- Totals -->
          <tr>
            <td style="padding: 8px 24px 0 24px;">
              <h2 style="${sectionTitleStyle}">Recapitulatif</h2>
              ${renderTotalsTable(totals)}
            </td>
          </tr>

          <!-- Blocked users -->
          <tr>
            <td style="padding: 24px 24px 0 24px;">
              <h2 style="${sectionTitleStyle}">Comptes bloques</h2>
              ${renderBlockedUsersTable(blockedUsers)}
            </td>
          </tr>

          <!-- Blocked IPs -->
          <tr>
            <td style="padding: 24px 24px 0 24px;">
              <h2 style="${sectionTitleStyle}">IP bloquees</h2>
              ${renderBlockedIpsTable(blockedIps)}
            </td>
          </tr>

          <!-- Permanently blocked accounts (current DB state) -->
          <tr>
            <td style="padding: 24px 24px 0 24px;">
              <h2 style="${sectionTitleStyle}">Comptes actuellement bloques (statut BLOCKED)</h2>
              ${renderPermanentlyBlockedTable(permanentlyBlockedAccounts ?? [])}
            </td>
          </tr>

          <!-- Footnote -->
          <tr>
            <td style="padding: 28px 24px 8px 24px;">
              <p style="font-family: ${FONT_STACK}; font-size: 12px; line-height: 1.5; color: ${
    COLORS.textSecondary
  }; margin: 0;">
                Cet email est genere automatiquement par DomiFa. Consultez le tableau de bord et la table <code style="font-family: monospace; background-color: ${
                  COLORS.surfaceAlt
                }; padding: 1px 4px; border-radius: 2px;">app_log</code> pour plus de details.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 24px 24px 24px; border-top: 1px solid ${
              COLORS.border
            };">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="font-family: ${FONT_STACK}; font-size: 12px; line-height: 1.5; color: ${
    COLORS.textSecondary
  };">
                    L'equipe DomiFa
                  </td>
                  <td style="text-align: right;">
                    <img src="https://domifa.fabrique.social.gouv.fr/assets/images/logo.png" alt="DomiFa" width="100" style="display: inline-block; width: 100px; height: auto;"/>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
