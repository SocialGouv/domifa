import { SupportSession } from "./SupportSession.interface";

// A support attachment as listed in the global history, with the names
// needed to display it outside of its structure.
export interface SupportSessionHistoryItem extends SupportSession {
  structureNom: string | null;
  accountNom: string | null;
  accountPrenom: string | null;
}
