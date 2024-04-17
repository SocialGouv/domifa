import { AppEntity } from "../../../_common/model";
import { Usager } from "./Usager.type";

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
    | "villeNaissance"
    | "telephone"
    | "import"
    | "pinnedNote"
    | "contactByPhone"
    | "datePremiereDom"
  >;
