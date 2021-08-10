import { UsagerImportObject } from "../../../model";

export const TEST_INVALID_IMPORT_USAGER: UsagerImportObject = {
  customId: "15b",
  civilite: "homme",
  nom: "Milano",
  prenom: "Paul",
  surnom: "Polo",
  dateNaissance: "15/06/2018",
  lieuNaissance: "Paris",
  phone: "01-02 03/04 05",
  email: "paul.dupont.168436@gmail.com",
  statutDom: "VALIDE",
  motifRefus: "",
  motifRadiation: "",
  typeDom: "PREMIERE_DOM",
  dateDebutDom: "10/03/2019",
  dateFinDom: "10/03/2020",
  datePremiereDom: "10/03/2019",
  dateDernierPassage: "18/12/2020",
  orientation: "NON",
  orientationDetails: "détails orientation",
  domiciliationExistante: "NON",
  revenus: "OUI",
  revenusDetail: "détails revenus",
  liencommune: "suivi social",
  compositionMenage: "FEMME_ISOLE_AVEC_ENFANT",
  situationResidentielle: "HEBERGEMENT_TIERS",
  situationDetails: "détails situation",
  causeInstabilite: "ERRANCE",
  causeDetail: "détails cause",
  raisonDemande: "EXERCICE_DROITS",
  raisonDemandeDetail: "détails raison demande",
  accompagnement: "NON",
  accompagnementDetail: "détails accompagnement",
  commentaires: "commentaires sur l'usager",
  ayantsDroits: [
    {
      nom: "Dupont",
      prenom: "Paula",
      dateNaissance: "15/07/2018",
      lienParente: "ENFANT",
    },
    {
      nom: "Dupont",
      prenom: "",
      dateNaissance: "15/07/1938",
      lienParente: "PARENT",
    },
  ],
};
