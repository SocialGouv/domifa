import { normalizeString } from "@domifa/common";

export type UsagerSearchIndexSource = {
  nom?: string | null;
  prenom?: string | null;
  surnom?: string | null;
  customRef?: string | null;
  ayantsDroits?:
    | ({ nom?: string | null; prenom?: string | null } | null)[]
    | null;
  options?: {
    procurations?: ({ nom?: string | null; prenom?: string | null } | null)[];
  } | null;
};

// La règle UNIQUE de l'index de recherche `nom_prenom_surnom_ref`. Employée
// par le subscriber (insertions et sauvegardes d'entités complètes), par la
// migration de rattrapage, et par les chemins d'écriture qui modifient un
// champ indexé via un `update()` partiel — ceux-ci posent la valeur
// explicitement dans leur payload plutôt que d'y joindre l'identité, ce qui
// écraserait une modification concurrente de l'état civil.
//
// Les ayants droit et les mandataires sont indexés parce que la recherche de
// l'interface les parcourt déjà ; `ref` est volontairement absent, l'interface
// ne cherche que `customRef` (cf. `getAttributes`).
export function computeUsagerSearchIndex(
  usager: UsagerSearchIndexSource
): string {
  const parts = [
    usager.nom?.trim(),
    usager.prenom?.trim(),
    usager.surnom,
    usager.customRef,
    ...(usager.ayantsDroits ?? []).flatMap((ayantDroit) => [
      ayantDroit?.nom,
      ayantDroit?.prenom,
    ]),
    ...(usager.options?.procurations ?? []).flatMap((procuration) => [
      procuration?.nom,
      procuration?.prenom,
    ]),
  ].filter(Boolean);

  return normalizeString(parts.join(" "));
}
