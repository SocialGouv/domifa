import { AppEntity } from "../../../_common/model";
import { Usager } from "./Usager.type";

export type UsagerLight = AppEntity &
  Pick<
    Usager,
    | "ref"
    | "customRef"
    | "structureId"
    | "nom"
    | "prenom"
    | "surnom"
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
    | "numeroDistribution"
    | "ayantsDroits"
    | "villeNaissance"
    | "telephone"
    | "langue"
    | "contactByPhone"
    | "import"
    | "usagerProfilUrl"
    | "echeanceInfos"
    | "rdvInfos"
    | "datePremiereDom"
    | "notes"
  >;
