import { UsagerRaisonDemande } from "../../../../_common/model";

export class Entretien {
  public domiciliation: boolean;
  public revenus: boolean;
  public revenusDetail: string;
  public orientation: boolean;
  public orientationDetail: string;
  public liencommune: string;
  public liencommuneDetail: string;
  public residence: string;
  public residenceDetail: string;
  public cause: string;
  public causeDetail: string;
  public raison: UsagerRaisonDemande;
  public rattachement: string;
  public raisonDetail: string;
  public accompagnement: boolean;
  public accompagnementDetail: string;
  public commentaires: string;
  public typeMenage: string;

  constructor(entretien?: any) {
    this.domiciliation = null;
    this.revenus = null;
    this.orientation = null;
    this.accompagnement = null;
    this.accompagnementDetail = null;

    if (entretien && typeof entretien.domiciliation !== "undefined") {
      this.domiciliation = entretien.domiciliation;
    }

    if (entretien && typeof entretien.revenus !== "undefined") {
      this.revenus = entretien.revenus;
    }
    this.revenusDetail = (entretien && entretien.revenusDetail) || null;

    if (entretien && typeof entretien.orientation !== "undefined") {
      this.orientation = entretien.orientation;
    }
    this.orientationDetail = (entretien && entretien.orientationDetail) || null;

    this.liencommune = (entretien && entretien.liencommune) || null;
    this.liencommuneDetail = (entretien && entretien.liencommuneDetail) || null;

    this.residence = (entretien && entretien.residence) || null;
    this.residenceDetail = (entretien && entretien.residenceDetail) || null;
    this.cause = (entretien && entretien.cause) || null;
    this.causeDetail = (entretien && entretien.causeDetail) || null;
    this.rattachement = (entretien && entretien.rattachement) || null;
    this.raison = (entretien && entretien.raison) || null;
    this.raisonDetail = (entretien && entretien.raisonDetail) || null;

    if (entretien && typeof entretien.accompagnement !== "undefined") {
      this.accompagnement = entretien.accompagnement;
    }

    this.accompagnementDetail =
      (entretien && entretien.accompagnementDetail) || null;

    this.commentaires = (entretien && entretien.commentaires) || null;
    this.typeMenage = (entretien && entretien.typeMenage) || null;
  }
}
