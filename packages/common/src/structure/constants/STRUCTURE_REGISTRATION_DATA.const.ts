import { CurrentTool, MarketTool, RegistrationSources } from "../interfaces";

export const SOURCES_OPTIONS: Array<{
  value: RegistrationSources;
  label: string;
  requiresDetail?: boolean;
}> = [
  { value: "PROSPECTION_DIRECTE", label: "Prospection en direct DomiFa" },
  {
    value: "AUTRE_STRUCTURE",
    label: "Autre structures domiciliataires",
    requiresDetail: true,
  },
  {
    value: "TETE_RESEAU",
    label: "Tête de réseau associatif (CRF / Aurore association…)",
    requiresDetail: true,
  },
  { value: "UNCCAS_UDCCAS", label: "UNCCAS / UDCCAS" },
  {
    value: "ACTEURS_ECOSYSTEME",
    label:
      "Acteurs de l'écosystème (FAS / AMF / ANCT / Mon suivi social / Plateforme de l'inclusion…)",
    requiresDetail: true,
  },
  {
    value: "REFERENTS_TERRITORIAUX",
    label:
      "Référents territoriaux (DGCS / DREETS / DDETS / DRHIL / UD DRHIL / Préfectures…)",
    requiresDetail: true,
  },
  { value: "SITE_BETAGOUV", label: "Site Betagouv" },
  { value: "SITE_FABRIQUE", label: "Site Fabrique" },
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "GUIDE_DGCS", label: "Guide domiciliation DGCS" },
  {
    value: "RECHERCHE_INTERNET",
    label: "Recherche internet sur outil de domiciliation",
  },
  { value: "AUTRE", label: "Autre canal", requiresDetail: true },
];

export const CURRENT_TOOL_OPTIONS: Array<{
  value: CurrentTool;
  label: string;
}> = [
  { value: "PAPIER", label: "Nous gérons la domiciliation sur papier" },
  { value: "EXCEL", label: "Sur excel" },
  { value: "OUTIL_INTERNE", label: "Un outil développé en interne" },
  { value: "OUTIL_MARCHE", label: "Un outil du marché" },
];

export const MARKET_TOOLS_OPTIONS: Array<{
  value: MarketTool;
  label: string;
}> = [
  { value: "ADILEOS", label: "Adileos" },
  { value: "BL_SOCIAL", label: "BL Social" },
  { value: "ELISSAR", label: "Elissar" },
  { value: "IMPLICITE", label: "Implicite" },
  { value: "IODAS", label: "Iodas" },
  { value: "LASTRIA", label: "Lastria" },
  { value: "MANO", label: "Mano" },
  { value: "MELISSANDE", label: "Melissande" },
  { value: "MILLESIME", label: "Millesime (Arche MC2 / Groupe Up)" },
  { value: "MON_SUIVI_SOCIAL", label: "Mon Suivi Social" },
  { value: "PAXTEL", label: "Paxtel" },
  { value: "SONATE", label: "Sonate (Arpège)" },
  { value: "AUTRE", label: "Autre (précisez)" },
];

export const REGISTRATION_SOURCES_VALUES = SOURCES_OPTIONS.map(
  (option) => option.value
);
export const CURRENT_TOOL_VALUES = CURRENT_TOOL_OPTIONS.map(
  (option) => option.value
);
export const MARKET_TOOL_VALUES = MARKET_TOOLS_OPTIONS.map(
  (option) => option.value
);
