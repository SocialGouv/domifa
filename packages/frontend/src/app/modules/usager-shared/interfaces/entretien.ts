import {
  UsagerEntretien,
  UsagerEntretienCause,
  UsagerEntretienLienCommune,
  UsagerEntretienRaisonDemande,
  UsagerEntretienResidence,
  UsagerEntretienTypeMenage,
} from "../../../../_common/model/usager/entretien";

export class Entretien implements UsagerEntretien {
  public domiciliation: boolean | null = null;
  public commentaires: string | null = null;
  public typeMenage: UsagerEntretienTypeMenage | null = null;
  public revenus: boolean | null = null;
  public revenusDetail: string | null = null;
  public orientation: boolean | null = null;
  public orientationDetail: string | null = null;
  public liencommune: UsagerEntretienLienCommune | null = null;
  public liencommuneDetail: string | null = null;
  public residence: UsagerEntretienResidence | null = null;
  public residenceDetail: string | null = null;
  public cause: UsagerEntretienCause | null = null;
  public causeDetail: string | null = null;
  public rattachement: string | null = null;
  public raison: UsagerEntretienRaisonDemande | null = null;
  public raisonDetail: string | null = null;
  public accompagnement: boolean | null = null;
  public accompagnementDetail: string | null = null;

  constructor(entretien?: Partial<UsagerEntretien> | null) {
    if (entretien) {
      this.domiciliation = entretien.domiciliation ?? null;
      this.commentaires = entretien.commentaires ?? null;
      this.typeMenage = entretien.typeMenage ?? null;
      this.revenus = entretien.revenus ?? null;
      this.revenusDetail = entretien.revenusDetail ?? null;
      this.orientation = entretien.orientation ?? null;
      this.orientationDetail = entretien.orientationDetail ?? null;
      this.liencommune = entretien.liencommune ?? null;
      this.liencommuneDetail = entretien.liencommuneDetail ?? null;
      this.residence = entretien.residence ?? null;
      this.residenceDetail = entretien.residenceDetail ?? null;
      this.cause = entretien.cause ?? null;
      this.causeDetail = entretien.causeDetail ?? null;
      this.rattachement = entretien.rattachement ?? null;
      this.raison = entretien.raison ?? null;
      this.raisonDetail = entretien.raisonDetail ?? null;
      this.accompagnement = entretien.accompagnement ?? null;
      this.accompagnementDetail = entretien.accompagnementDetail ?? null;
    }
  }
}
