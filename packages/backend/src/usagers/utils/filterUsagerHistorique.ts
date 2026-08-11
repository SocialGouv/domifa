import { Usager, UsagerDecision } from "@domifa/common";

// `historique` cumule une entrée par décision jamais prise, texte libre
// compris : c'est la colonne la plus lourde de la table, et la seule dont le
// poids croît pendant toute la vie d'un dossier. Les listes n'affichent que
// ces quatre champs.
//
// Ne pas réduire davantage. `getDecisionDeadline` lit la longueur du tableau
// ET son avant-dernière entrée pour un dossier en ATTENTE_DECISION : ne garder
// que les dernières entrées ferait afficher une échéance fausse, sans erreur.
export const filterUsagerHistorique = <T extends Pick<Usager, "historique">>(
  usager: T
): T => {
  if (usager.historique && Array.isArray(usager.historique)) {
    usager.historique = usager.historique.map((item: UsagerDecision) => ({
      statut: item.statut,
      dateDecision: item.dateDecision,
      dateDebut: item.dateDebut,
      dateFin: item.dateFin,
    })) as UsagerDecision[];
  }
  return usager;
};
