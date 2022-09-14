import { AppEntity } from "../../../_common/model";
import { Usager } from "./Usager.type";

export type UsagerLight = AppEntity &
  Pick<
    Usager,
    | "ref"
    | "updatedAt"
    | "customRef"
    | "structureId"
    | "nom"
    | "prenom"
    | "surnom"
    | "numeroDistribution"
    | "sexe"
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
    | "ayantsDroits"
    | "villeNaissance"
    | "telephone"
    | "import"
    | "langue"
    | "contactByPhone"
    | "datePremiereDom"
    | "notes"
  >;
