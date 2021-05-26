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
    | "docs"
    | "entretien"
    | "etapeDemande"
    | "rdv"
    | "lastInteraction"
    | "options"
    | "historique"
    | "ayantsDroits"
    | "villeNaissance"
    | "phone"
    | "langue"
    | "preference"
    | "dateToDisplay"
    | "usagerProfilUrl"
    | "datePremiereDom"
  >;
