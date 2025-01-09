import { AppEntity, Usager } from "@domifa/common";

export type UsagerLight = AppEntity &
  Pick<
    Usager,
    | "ref"
    | "uuid"
    | "customRef"
    | "structureId"
    | "nom"
    | "prenom"
    | "surnom"
    | "sexe"
    | "statut"
    | "dateNaissance"
    | "email"
    | "decision"
    | "typeDom"
    | "entretien"
    | "etapeDemande"
    | "rdv"
    | "lastInteraction"
    | "options"
    | "historique"
    | "numeroDistribution"
    | "ayantsDroits"
    | "villeNaissance"
    | "telephone"
    | "langue"
    | "contactByPhone"
    | "import"
    | "echeanceInfos"
    | "rdvInfos"
    | "pinnedNote"
    | "datePremiereDom"
    | "nbNotes"
  > & {
    phoneNumber?: string;
  };
