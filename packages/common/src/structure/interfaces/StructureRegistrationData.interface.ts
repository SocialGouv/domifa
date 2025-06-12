export type RegistrationSources =
  | "PROSPECTION_DIRECTE"
  | "AUTRE_STRUCTURE"
  | "TETE_RESEAU"
  | "UNCCAS_UDCCAS"
  | "ACTEURS_ECOSYSTEME"
  | "REFERENTS_TERRITORIAUX"
  | "SITE_BETAGOUV"
  | "SITE_FABRIQUE"
  | "LINKEDIN"
  | "GUIDE_DGCS"
  | "RECHERCHE_INTERNET"
  | "AUTRE";

export type CurrentTool = "PAPIER" | "EXCEL" | "OUTIL_INTERNE" | "OUTIL_MARCHE";

export type MarketTool =
  | "ADILEOS"
  | "BL_SOCIAL"
  | "ELISSAR"
  | "IMPLICITE"
  | "IODAS"
  | "LASTRIA"
  | "MANO"
  | "MELISSANDE"
  | "MILLESIME"
  | "MON_SUIVI_SOCIAL"
  | "PAXTEL"
  | "SONATE"
  | "AUTRE";

export interface StructureRegistrationData {
  source: RegistrationSources;
  sourceDetail?: string;
  activeUsersCount: number;
  dsp?: boolean; // OA uniquement, "délégation de service public"
  currentTool: CurrentTool;
  marketTool?: MarketTool;
  marketToolOther?: string;
}
