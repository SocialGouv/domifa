import { format } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { fr } from "date-fns/locale";

import {
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
  bot_ua: "Bot/scraper (User-Agent suspect)",
  missing_ua: "User-Agent absent",
  invalid_origin: "Origin/Referer non autorise",
  BLOCK_USER: "Blocage automatique du compte",
  REQUEST_BLOCKED: "Requete rejetee (filtre)",
  THROTTLE_BLOCKED: "Quota IP depasse",
};

const ACTION_LABELS: Record<string, string> = {
  BLOCK_USER: "Comptes bloques automatiquement",
  REQUEST_BLOCKED: "Requetes rejetees (filtre bot/origin)",
  THROTTLE_BLOCKED: "Quotas IP depasses",
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
            <span style="display: inline-block; padding: 2px 8px; background-color: ${
              COLORS.blueLight
            }; color: ${
          COLORS.blueFrance
        }; border-radius: 3px; font-size: 12px; font-weight: 700; margin-right: 8px;">${escapeHtml(
          action
        )}</span>
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
    user.structureId !== undefined ? `Structure : ${user.structureId}` : null,
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
  `;
}

function renderIpHighlight(
  ip: SuspiciousActivitySummary["blockedIps"][0]
): string {
  const reasons = ip.reasons.map(humanizeReason).join(", ");
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
          <td style="${cellStyle}">${user.structureId ?? "-"}</td>
          <td style="${cellStyle}">${escapeHtml(user.email ?? "-")}</td>
          <td style="${cellStyle}">${escapeHtml(
          humanizeReason(user.reason)
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
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
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
        <th style="${headerCellStyle}">Derniere URL</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

export function generateSecurityAlertEmailHtml(
  summary: SuspiciousActivitySummary,
  envId: string
): string {
  const { windowStart, windowEnd, totals, blockedUsers, blockedIps } = summary;
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
              <h2 style="${sectionTitleStyle}">Comptes bloques <span style="font-size: 12px; font-weight: 400; color: ${
    COLORS.textSecondary
  };">(BLOCK_USER)</span></h2>
              ${renderBlockedUsersTable(blockedUsers)}
            </td>
          </tr>

          <!-- Blocked IPs -->
          <tr>
            <td style="padding: 24px 24px 0 24px;">
              <h2 style="${sectionTitleStyle}">IP bloquees <span style="font-size: 12px; font-weight: 400; color: ${
    COLORS.textSecondary
  };">(REQUEST_BLOCKED / THROTTLE_BLOCKED)</span></h2>
              ${renderBlockedIpsTable(blockedIps)}
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
