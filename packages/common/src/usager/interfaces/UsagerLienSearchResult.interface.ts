// Response DTO for POST usagers-lien/:usagerRef/search. Only ever returns
// these 5 fields, never the full dossier.
export interface UsagerLienSearchResult {
  uuid: string;
  nom: string;
  prenom: string;
  dateNaissance: Date;
  customRef: string | null;
  alreadyLinkedTo: { nom: string; prenom: string } | null;
}
