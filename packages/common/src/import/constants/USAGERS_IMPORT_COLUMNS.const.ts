export const USAGERS_IMPORT_COLUMNS: Record<
  string,
  {
    index: number;
    label: string;
  }
> = {
  customRef: { index: 0, label: "Numéro d'identification" },
  civilite: { index: 1, label: "Civilité" },
  nom: { index: 2, label: "Nom" },
  prenom: { index: 3, label: "Prénom" },
  surnom: { index: 4, label: "Nom d'usage / Surnom" },
  dateNaissance: { index: 5, label: "Date naissance" },
  lieuNaissance: { index: 6, label: "Lieu naissance" },
  telephone: { index: 7, label: "Téléphone" },
  email: { index: 8, label: "Email" },
  statutDom: { index: 9, label: "Statut domiciliation" },
  motifRefus: { index: 10, label: "Motif de refus" },
  motifRadiation: { index: 11, label: "Motif de radiation" },
  typeDom: { index: 12, label: "Type de domiciliation" },
  dateDebutDom: { index: 13, label: "Date de Début de la domiciliation" },
  dateFinDom: { index: 14, label: "Date de fin de la domiciliation" },
  datePremiereDom: { index: 15, label: "Date 1ere domiciliation" },
  dateDernierPassage: { index: 16, label: "Date de dernier passage" },
  orientation: { index: 17, label: "Orientation" },
  orientationDetail: { index: 18, label: "Détails de l'orientation" },
  domiciliationExistante: {
    index: 19,
    label: "La personne a t-elle déjà une domiciliation ?",
  },
  situationPro: {
    index: 20,
    label: "Quelle est la situation professionnelle ?",
  },
  situationProDetail: {
    index: 21,
    label: "Quelle est la situation professionnelle ?",
  },
  revenus: { index: 22, label: "Le domicilié possède t-il des revenus ?" },
  revenusDetail: {
    index: 23,
    label: "Seulement si revenus, de quelle nature ?",
  },
  liencommune: { index: 24, label: "Lien avec la commune" },
  liencommuneDetail: { index: 25, label: "Détail du lien avec la commune" },
  typeMenage: { index: 26, label: "Composition du ménage" },
  residence: { index: 27, label: "Situation résidentielle" },
  residenceDetail: {
    index: 28,
    label: "Si autre situation résidentielle, précisez",
  },
  causeInstabilite: { index: 29, label: "Cause instabilité logement" },
  causeDetail: { index: 30, label: "Si autre cause, précisez" },
  raisonDemande: { index: 31, label: "Motif principal de la demande" },
  raisonDemandeDetail: { index: 32, label: "Si autre motif, précisez" },
  accompagnement: { index: 33, label: "Accompagnement social" },
  accompagnementDetail: {
    index: 34,
    label: "Par quelle structure est fait l'accompagnement ?",
  },
  commentaires: { index: 35, label: "Commentaires" },
};
