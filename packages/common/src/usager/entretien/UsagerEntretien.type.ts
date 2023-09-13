import {
  UsagerEntretienLienCommune,
  UsagerEntretienResidence,
  UsagerEntretienCause,
  UsagerEntretienRaisonDemande,
  UsagerEntretienTypeMenage,
} from ".";

export interface UsagerEntretien {
  uuid?: string;
  usagerUUID: string;
  structureId: number;
  usagerRef: number;
  domiciliation: boolean | null;
  commentaires: string | null;

  typeMenage: UsagerEntretienTypeMenage | null;

  revenus: boolean | null;
  revenusDetail: string | null;

  orientation: boolean | null;
  orientationDetail: string | null;

  liencommune: UsagerEntretienLienCommune | null;
  liencommuneDetail: string | null;

  residence: UsagerEntretienResidence | null;
  residenceDetail: string | null;

  cause: UsagerEntretienCause | null;
  causeDetail: string | null;

  rattachement: string | null;

  raison: UsagerEntretienRaisonDemande | null;
  raisonDetail: string | null;

  accompagnement: boolean | null;
  accompagnementDetail: string | null;
}
