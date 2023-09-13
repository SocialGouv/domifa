import {
  UsagerEntretienCause,
  UsagerEntretienLienCommune,
  UsagerEntretienRaisonDemande,
  UsagerEntretienResidence,
  UsagerEntretienTypeMenage,
} from "@domifa/common";
import { UsagerEntretien } from "../../../../_common/model";

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
    this.accompagnement =
      typeof entretien?.accompagnement !== "undefined"
        ? entretien?.accompagnement
        : null;
    this.accompagnementDetail = entretien?.accompagnementDetail || null;
    this.cause = entretien?.cause || null;
    this.causeDetail = entretien?.causeDetail || null;
    this.commentaires = entretien?.commentaires || null;
    this.domiciliation =
      typeof entretien?.domiciliation !== "undefined"
        ? entretien?.domiciliation
        : null;
    this.liencommune = entretien?.liencommune || null;
    this.liencommuneDetail = entretien?.liencommuneDetail || null;
    this.orientation =
      typeof entretien?.orientation !== "undefined"
        ? entretien?.orientation
        : null;
    this.orientationDetail = entretien?.orientationDetail || null;
    this.raison = entretien?.raison || null;
    this.raisonDetail = entretien?.raisonDetail || null;
    this.rattachement = entretien?.rattachement || null;
    this.residence = entretien?.residence || null;
    this.residenceDetail = entretien?.residenceDetail || null;
    this.revenus =
      typeof entretien?.revenus !== "undefined" ? entretien?.revenus : null;
    this.revenusDetail = entretien?.revenusDetail || null;
    this.typeMenage = entretien?.typeMenage || null;
  }
}
