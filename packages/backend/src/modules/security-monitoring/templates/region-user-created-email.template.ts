import { REGIONS_LISTE } from "@domifa/common";

import { RegionUserCreatedNotice } from "../types/security-alert.types";
import {
  escapeHtml,
  formatParisDateTime,
} from "./security-alert-email.template";

const FONT_STACK = "Marianne, Arial, Helvetica, sans-serif";

const describeUser = (user: RegionUserCreatedNotice["creator"]): string =>
  `${escapeHtml(`${user.prenom} ${user.nom}`)} (${escapeHtml(user.email)})`;

// Plain notice sent to the DomiFa team each time a DREETS invites another
// regional account from the pilotage portal.
export function generateRegionUserCreatedEmailHtml(
  notice: RegionUserCreatedNotice,
  envId: string
): string {
  const region = `${notice.region} - ${REGIONS_LISTE[notice.region] ?? ""}`;
  const row = (label: string, value: string) =>
    `<tr><td style="padding: 6px 12px 6px 0; font-weight: 700; vertical-align: top;">${label}</td><td style="padding: 6px 0;">${value}</td></tr>`;

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/></head>
<body style="margin: 0; padding: 24px; font-family: ${FONT_STACK}; font-size: 14px; line-height: 1.5; color: #161616; background-color: #ffffff;">
  <h1 style="font-size: 20px; margin: 0 0 16px 0;">Nouveau compte DREETS créé depuis le portail de pilotage</h1>
  <p style="margin: 0 0 16px 0;">
    Une DREETS a invité un nouvel utilisateur de niveau régional. Vérifiez que
    cette personne fait bien partie des services de la région. En cas de doute,
    supprimez le compte depuis le portail admin.
  </p>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0">
    ${row("Environnement", escapeHtml(envId))}
    ${row("Date", formatParisDateTime(notice.createdAt))}
    ${row("Région", escapeHtml(region))}
    ${row("Compte créé", describeUser(notice.createdUser))}
    ${row("Créé par", describeUser(notice.creator))}
  </table>
  <p style="margin: 24px 0 0 0; font-size: 12px; color: #666666;">
    Cet email est généré automatiquement par DomiFa.
  </p>
</body>
</html>`;
}
