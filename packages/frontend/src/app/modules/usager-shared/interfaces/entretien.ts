import {
  UsagerEntretien,
  UsagerEntretienCause,
  UsagerEntretienLienCommune,
  UsagerEntretienRaisonDemande,
  UsagerEntretienResidence,
  UsagerEntretienTypeMenage,
} from "../../../../_common/model/usager/entretien";

export class Entretien implements UsagerEntretien {
  public domiciliation: boolean | null;
  public commentaires: string | null;
  public typeMenage: UsagerEntretienTypeMenage | null;
  public revenus: boolean | null;
  public revenusDetail: string | null;
  public orientation: boolean | null;
  public orientationDetail: string | null;
  public liencommune: UsagerEntretienLienCommune | null;
  public liencommuneDetail: string | null;
  public residence: UsagerEntretienResidence | null;
  public residenceDetail: string | null;
  public cause: UsagerEntretienCause | null;
  public causeDetail: string | null;
  public rattachement: string | null;
  public raison: UsagerEntretienRaisonDemande | null;
  public raisonDetail: string | null;
  public accompagnement: boolean | null;
  public accompagnementDetail: string | null;

  constructor(entretien?: Partial<UsagerEntretien> | null) {
    this.domiciliation = entretien?.domiciliation || null;
    this.commentaires = entretien?.commentaires || null;
    this.typeMenage = entretien?.typeMenage || null;
    this.revenus = entretien?.revenus || null;
    this.revenusDetail = entretien?.revenusDetail || null;
    this.orientation = entretien?.orientation || null;
    this.orientationDetail = entretien?.orientationDetail || null;
    this.liencommune = entretien?.liencommune || null;
    this.liencommuneDetail = entretien?.liencommuneDetail || null;
    this.residence = entretien?.residence || null;
    this.residenceDetail = entretien?.residenceDetail || null;
    this.cause = entretien?.cause || null;
    this.causeDetail = entretien?.causeDetail || null;
    this.rattachement = entretien?.rattachement || null;
    this.raison = entretien?.raison || null;
    this.raisonDetail = entretien?.raisonDetail || null;
    this.accompagnement = entretien?.accompagnement || null;
    this.accompagnementDetail = entretien?.accompagnementDetail || null;
  }
}
