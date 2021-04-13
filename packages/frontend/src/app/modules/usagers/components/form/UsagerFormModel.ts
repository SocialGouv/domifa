import {
  UsagerDoc,
  UsagerLight,
  UsagerSexe,
} from "../../../../../_common/model";
import { ETAPE_ETAT_CIVIL } from "../../../../../_common/model/usager/ETAPES_DEMANDE.const";
import { UsagerAyantDroit } from "../../../../../_common/model/usager/UsagerAyantDroit.type";
import { UsagerDecision } from "../../../../../_common/model/usager/UsagerDecision.type";
import { regexp } from "../../../../shared/validators";
import { Decision } from "../../interfaces/decision";
import { Doc } from "../../interfaces/doc";
import { Entretien } from "../../interfaces/entretien";
import { Options } from "../../interfaces/options";
import { Rdv } from "../../interfaces/rdv";
import { usagersFilter, UsagersFilterCriteria } from "../manage/usager-filter";

export class UsagerFormModel {
  public ref: number;
  public customRef: string;
  public nom: string;
  public prenom: string;
  public surnom: string;

  public sexe: UsagerSexe;
  public langue: string;
  public dateNaissance: Date | null;
  public villeNaissance: string;

  // Infos de contact
  public email: string;
  public phone: string;

  public preference: {
    email: boolean;
    phone: boolean;
    phoneNumber?: string;
  };

  public structureId: number;
  public etapeDemande: number;

  public docs: UsagerDoc[];
  public entretien: Entretien;
  public rdv: Rdv;

  // Ayants-droits
  public ayantsDroitsExist: boolean;
  public ayantsDroits: UsagerAyantDroit[];

  // Historique des décisions et dernière décision
  public historique: Decision[];
  public decision: Decision;
  public typeDom: string; // PREMIERE / RENOUVELLEMENT

  public lastInteraction: {
    dateInteraction: Date;
    enAttente: boolean;
    courrierIn: number;
    recommandeIn: number;
    colisIn: number;
  };

  public options: Options;

  // VARIABLES UTILES AU FRONT UNIQUEMENT

  // Recherche : si la requête fait remonté un ayant-droit
  public isAyantDroit: boolean;
  public isActif: boolean;
  public dayBeforeEnd: number;

  constructor(
    usager?: Partial<UsagerLight>,
    filterCriteria?: UsagersFilterCriteria
  ) {
    this.ref = (usager && usager.ref) || 0;
    this.customRef = (usager && usager.customRef) || null;

    this.sexe = (usager && usager.sexe) || "homme";
    this.nom = (usager && usager.nom) || "";
    this.prenom = (usager && usager.prenom) || "";
    this.langue = (usager && usager.langue) || "";

    this.surnom = (usager && usager.surnom) || "";

    this.dateNaissance = null;

    this.historique = [];

    if (usager && usager.dateNaissance !== null) {
      this.dateNaissance = new Date(usager.dateNaissance);
    }

    this.villeNaissance = (usager && usager.villeNaissance) || "";

    this.email = (usager && usager.email) || "";
    this.phone = (usager && usager.phone) || "";
    this.docs = (usager && usager.docs) || [];

    this.structureId = (usager && usager.structureId) || null;
    this.etapeDemande = (usager && usager.etapeDemande) || ETAPE_ETAT_CIVIL;

    if (usager && usager.historique) {
      this.historique = [];
      usager.historique.forEach((decision: UsagerDecision) => {
        this.historique.push(new Decision(decision));
      });

      this.historique.sort((a, b) => {
        return b.dateDecision.getTime() - a.dateDecision.getTime();
      });
    }

    this.rdv = (usager && new Rdv(usager.rdv)) || new Rdv({});

    this.lastInteraction = {
      dateInteraction: null,
      enAttente: false,
      courrierIn: 0,
      recommandeIn: 0,
      colisIn: 0,
    };

    if (usager && usager.lastInteraction) {
      this.lastInteraction = {
        dateInteraction: new Date(usager.lastInteraction.dateInteraction),
        enAttente: usager.lastInteraction.enAttente || false,
        courrierIn: usager.lastInteraction.courrierIn || 0,
        recommandeIn: usager.lastInteraction.recommandeIn || 0,
        colisIn: usager.lastInteraction.colisIn || 0,
      };
    }

    this.entretien =
      (usager && new Entretien(usager.entretien)) || new Entretien({});

    this.docs = [];

    if (usager && usager.docs) {
      usager.docs.forEach((doc: Doc) => {
        this.docs.push(new Doc(doc));
      });
    }

    this.ayantsDroits = (usager && usager.ayantsDroits) || [];
    this.ayantsDroitsExist = this.ayantsDroits && this.ayantsDroits.length > 0;

    console.log(new RegExp(regexp.mobilePhone).test(this.phone));
    this.preference = (usager && usager.preference) || {
      email: false,
      phone: false,
      phoneNumber: new RegExp(regexp.mobilePhone).test(this.phone)
        ? this.phone
        : "",
    };

    this.decision = (usager && new Decision(usager.decision)) || new Decision();

    this.isActif = false;
    this.dayBeforeEnd = 365;

    let dateFinToCheck: Date = null;

    // Récupération de la date de fin de la domiciliation

    if (this.decision.statut === "VALIDE") {
      dateFinToCheck = this.decision.dateFin;
      this.isActif = true;
    } else if (
      this.decision.statut === "INSTRUCTION" &&
      this.typeDom === "RENOUVELLEMENT"
    ) {
      this.isActif = true;
      dateFinToCheck = this.historique[0].dateFin;
    } else if (
      this.decision.statut === "ATTENTE_DECISION" &&
      this.typeDom === "RENOUVELLEMENT"
    ) {
      this.isActif = true;
      dateFinToCheck = this.historique[1].dateFin;
    }

    if (dateFinToCheck) {
      const today = new Date();
      const msPerDay: number = 1000 * 60 * 60 * 24;
      const start: number = today.getTime();
      const end: number = this.decision.dateFin.getTime();

      this.dayBeforeEnd = Math.ceil((end - start) / msPerDay);
    }

    this.typeDom = (usager && usager.typeDom) || "PREMIERE";

    this.options = (usager && new Options(usager.options)) || new Options({});

    this.isAyantDroit = false;

    const { searchString } = filterCriteria ?? {};
    if (searchString && searchString !== null) {
      // if search does not match without ayant-droits, flag it as "isAyantDroit"
      this.isAyantDroit =
        usagersFilter.filter([usager as UsagerLight], {
          criteria: {
            ...filterCriteria,
            searchInAyantDroits: false,
          },
        }).length === 0;
    }
  }
}
