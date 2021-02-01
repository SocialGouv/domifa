import { AppEntity } from "../../../_common/model";
import { UsagerPG } from "./UsagerPG.type";

export type UsagerLight = AppEntity &
  Pick<
    UsagerPG,
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
  >;
