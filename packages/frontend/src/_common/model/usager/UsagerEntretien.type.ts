import { UsagerRaisonDemande } from "./UsagerRaisonDemande.type";

export type UsagerEntretien = {
  domiciliation?: boolean;

  revenus?: boolean;
  revenusDetail?: string;

  orientation?: boolean;
  orientationDetail?: string;

  typeMenage?: string;
  liencommune?: string;
  residence?: string;
  residenceDetail?: string;
  cause?: string;
  causeDetail?: string;

  pourquoi?: string;
  pourquoiDetail?: string;

  rattachement?: string;

  raison?: UsagerRaisonDemande;
  raisonDetail?: string;

  accompagnement?: boolean;
  accompagnementDetail?: string;

  commentaires?: string;
};
