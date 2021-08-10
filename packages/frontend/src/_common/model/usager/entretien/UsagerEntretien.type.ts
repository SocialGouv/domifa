import {
  UsagerEntretienLienCommune,
  UsagerEntretienResidence,
  UsagerEntretienCause,
  UsagerEntretienRaisonDemande,
  UsagerEntretienTypeMenage,
} from ".";

export type UsagerEntretien = {
  domiciliation?: boolean;
  commentaires?: string;

  typeMenage?: UsagerEntretienTypeMenage;

  revenus?: boolean;
  revenusDetail?: string;

  orientation?: boolean;
  orientationDetail?: string;

  liencommune?: UsagerEntretienLienCommune;
  liencommuneDetail?: string;

  residence?: UsagerEntretienResidence;
  residenceDetail?: string;

  cause?: UsagerEntretienCause;
  causeDetail?: string;

  rattachement?: string;

  raison?: UsagerEntretienRaisonDemande;
  raisonDetail?: string;

  accompagnement?: boolean;
  accompagnementDetail?: string;
};
