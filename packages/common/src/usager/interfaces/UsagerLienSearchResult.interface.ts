// DTO de réponse pour POST usagers-lien/:usagerRef/search. Ne renvoie
// jamais que ces 5 champs, jamais le dossier complet.
export interface UsagerLienSearchResult {
  uuid: string;
  nom: string;
  prenom: string;
  dateNaissance: Date;
  customRef: string | null;
  alreadyLinkedTo: { nom: string; prenom: string } | null;
}
