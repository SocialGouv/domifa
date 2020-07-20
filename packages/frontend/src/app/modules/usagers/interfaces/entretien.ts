export class Entretien {
  public domiciliation: boolean;
  public revenus: boolean;
  public revenusDetail: string;
  public orientation: boolean;
  public orientationDetail: string;
  public liencommune: string;
  public residence: string;
  public residenceDetail: string;
  public cause: string;
  public causeDetail: string;
  public raison: string;
  public raisonDetail: string;
  public accompagnement: boolean;
  public accompagnementDetail: string;
  public commentaires: string;
  public typeMenage: string;

  constructor(entretien?: any) {
    this.domiciliation = (entretien && entretien.domiciliation) || null;
    this.revenus = (entretien && entretien.revenus) || null;
    this.revenusDetail = (entretien && entretien.revenusDetail) || null;
    this.orientation = (entretien && entretien.orientation) || null;
    this.orientationDetail = (entretien && entretien.orientationDetail) || null;
    this.liencommune = (entretien && entretien.liencommune) || null;
    this.residence = (entretien && entretien.residence) || null;
    this.residenceDetail = (entretien && entretien.residenceDetail) || null;
    this.cause = (entretien && entretien.cause) || null;
    this.causeDetail = (entretien && entretien.causeDetail) || null;
    this.raison = (entretien && entretien.raison) || null;
    this.raisonDetail = (entretien && entretien.raisonDetail) || null;
    this.accompagnement = (entretien && entretien.accompagnement) || null;
    this.accompagnementDetail =
      (entretien && entretien.accompagnementDetail) || null;
    this.commentaires = (entretien && entretien.commentaires) || null;
    this.typeMenage = (entretien && entretien.typeMenage) || null;
  }
}
