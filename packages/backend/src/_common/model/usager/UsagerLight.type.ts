import { Usager } from "@domifa/common";
import { AppEntity } from "../../../_common/model";

export type UsagerLight = AppEntity &
  Pick<
    Usager,
    | "uuid"
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
    | "nationalite"
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
    | "referrerId"
    | "villeNaissance"
    | "telephone"
    | "import"
    | "pinnedNote"
    | "contactByPhone"
    | "datePremiereDom"
  >;
