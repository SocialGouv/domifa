import { UsagerEntretien } from "./../../../../_common/model/usager/entretien/UsagerEntretien.type";
import {
  UsagerEntretienCause,
  UsagerEntretienLienCommune,
  UsagerEntretienRaisonDemande,
  UsagerEntretienResidence,
  UsagerEntretienTypeMenage,
} from "../../../../_common/model/usager/entretien";

export class Entretien implements UsagerEntretien {
  public domiciliation: boolean;

  public revenus: boolean;
  public revenusDetail: string;

  public orientation: boolean;
  public orientationDetail: string;

  public typeMenage: UsagerEntretienTypeMenage;

  public liencommune: UsagerEntretienLienCommune;
  public liencommuneDetail: string;

  public residence: UsagerEntretienResidence;
  public residenceDetail: string;

  public cause: UsagerEntretienCause;
  public causeDetail: string;

  public raison: UsagerEntretienRaisonDemande;
  public raisonDetail: string;

  public rattachement: string;

  public accompagnement: boolean;
  public accompagnementDetail: string;

  public commentaires: string;

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
