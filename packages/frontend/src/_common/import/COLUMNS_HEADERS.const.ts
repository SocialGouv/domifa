export const COLUMNS_HEADERS = [
  "Numéro d'identification",
  "Civilité",
  "Nom",
  "Prénom",
  "Nom d'usage / Surnom",
  "Date naissance",
  "Lieu naissance",
  "Téléphone",
  "Email",
  "Statut demande",
  "Motif de refus",
  "Motif de radiation",
  "Type de domiciliation",
  "Date de Début de la domiciliation",
  "Date de fin de la domiciliation",
  "Date 1ere domiciliation",
  "Date de dernier passage",
  "Orientation",
  "Détails de l'orientation",
  "La personne a t-elle déjà une domiciliation ?",
  "Le domicilié possède t-il des revenus ?",
  "Seulement si revenus, de quelle nature ?",
  "Lien avec la commune",
  "Composition du ménage",
  "Situation résidentielle",
  "Si autre situation résidentielle, précisez",
  "Cause instabilité logement",
  "Si autre cause, précisez",
  "Motif principal de la demande",
  "Si autre motif, précisez",
  "Accompagnement social",
  "Par quelle structure est fait l'accompagnement ?",
  "Commentaires",
];

for (let cpt = 0; cpt < 10; cpt++) {
  COLUMNS_HEADERS.push("Ayant-droit " + cpt + ": nom");
  COLUMNS_HEADERS.push("Ayant-droit " + cpt + ": prénom");
  COLUMNS_HEADERS.push("Ayant-droit " + cpt + ": date naissance");
  COLUMNS_HEADERS.push("Ayant-droit " + cpt + ": lien parenté");
}
