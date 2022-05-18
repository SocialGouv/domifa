import { UsagerEntretien } from "./../../../../_common/model/usager/entretien/UsagerEntretien.type";
import {
  UsagerEntretienCause,
  UsagerEntretienLienCommune,
  UsagerEntretienRaisonDemande,
  UsagerEntretienResidence,
  UsagerEntretienTypeMenage,
} from "../../../../_common/model/usager/entretien";

export class Entretien implements UsagerEntretien {
  public domiciliation?: boolean | null;
  public commentaires?: string | null;

  public typeMenage?: UsagerEntretienTypeMenage | null;

  public revenus?: boolean | null;
  public revenusDetail?: string | null;

  public orientation?: boolean | null;
  public orientationDetail?: string | null;

  public liencommune?: UsagerEntretienLienCommune | null;
  public liencommuneDetail?: string | null;

  public residence?: UsagerEntretienResidence | null;
  public residenceDetail?: string | null;

  public cause?: UsagerEntretienCause | null;
  public causeDetail?: string | null;

  public rattachement?: string | null;

  public raison?: UsagerEntretienRaisonDemande | null;
  public raisonDetail?: string | null;

  public accompagnement?: boolean | null;
  public accompagnementDetail?: string | null;

  constructor(entretien?: Partial<UsagerEntretien> | null) {
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
    this.causeDetail = (entretien && entretien?.causeDetail) || null;

    this.rattachement = (entretien && entretien.rattachement) || null;

    this.raison = (entretien && entretien.raison) || null;
    this.raisonDetail = (entretien && entretien?.raisonDetail) || null;

    if (entretien && typeof entretien.accompagnement !== "undefined") {
      this.accompagnement = entretien.accompagnement;
    }

    this.accompagnementDetail =
      (entretien && entretien.accompagnementDetail) || null;

    this.commentaires = (entretien && entretien.commentaires) || null;
    this.typeMenage = (entretien && entretien.typeMenage) || null;
  }
}
