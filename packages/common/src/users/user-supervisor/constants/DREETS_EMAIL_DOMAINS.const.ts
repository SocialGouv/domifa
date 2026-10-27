// Email domains of the DREETS / DRIEETS / DEETS agents, by region code.
//
// Unlike the DDETS domains, these are shared between regions (every
// metropolitan DREETS uses dreets.gouv.fr), so the domain only proves that the
// agent works in a regional labour service, not in which region. The region
// itself is always pinned server-side to one of the creator's territories.
//
// Deliberately left out, so their accounts stay created by the DomiFa team:
// - 03 (Guyane): regional service merged into the DGCOPOP, domain to confirm
// - NC, PO, SB, SM, SP, WF, TF: no DREETS-equivalent service
const DREETS_METROPOLE_DOMAINS: readonly string[] = ["dreets.gouv.fr"];
const DEETS_OUTRE_MER_DOMAINS: readonly string[] = ["deets.gouv.fr"];

export const DREETS_EMAIL_DOMAINS: Readonly<Record<string, readonly string[]>> =
  {
    "01": DEETS_OUTRE_MER_DOMAINS,
    "02": DEETS_OUTRE_MER_DOMAINS,
    "04": DEETS_OUTRE_MER_DOMAINS,
    "06": DEETS_OUTRE_MER_DOMAINS,
    "11": ["drieets.gouv.fr"],
    "24": DREETS_METROPOLE_DOMAINS,
    "27": DREETS_METROPOLE_DOMAINS,
    "28": DREETS_METROPOLE_DOMAINS,
    "32": DREETS_METROPOLE_DOMAINS,
    "44": DREETS_METROPOLE_DOMAINS,
    "52": DREETS_METROPOLE_DOMAINS,
    "53": DREETS_METROPOLE_DOMAINS,
    "75": DREETS_METROPOLE_DOMAINS,
    "76": DREETS_METROPOLE_DOMAINS,
    "84": DREETS_METROPOLE_DOMAINS,
    "93": DREETS_METROPOLE_DOMAINS,
    "94": DREETS_METROPOLE_DOMAINS,
  };
