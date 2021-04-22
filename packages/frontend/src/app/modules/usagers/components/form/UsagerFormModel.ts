import {
  UsagerDoc,
  UsagerLight,
  UsagerSexe,
  UsagerTypeDom,
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
  public customRef: string | null;
  public nom: string;
  public prenom: string;
  public surnom: string;

  public sexe: UsagerSexe;
  public langue: string;

  // Naissance
  public dateNaissance: Date | null;
  public villeNaissance: string;

  // Infos de contact
  public email: string;
  public phone: string;

  // Préférence d'envoi de notifs
  public preference: {
    email: boolean;
    phone: boolean;
    phoneNumber?: string;
  };

  public structureId: number | null;
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
  public typeDom: UsagerTypeDom; // PREMIERE / RENOUVELLEMENT

  public lastInteraction: {
    dateInteraction: Date;
    enAttente: boolean;
    courrierIn: number;
    recommandeIn: number;
    colisIn: number;
  };

  // TRANSFERT & PROCUS
  public options: Options;

  // ***
  // VARIABLES UTILES AU FRONT UNIQUEMENT
  // Recherche : si la requête fait remonté un ayant-droit
  public isAyantDroit: boolean;

  // Dossier actuellement actif
  public isActif: boolean;
  public dayBeforeEnd: number;

  // Dates à afficher sur le manage, couleur selon le statut
  public dateToDisplay: Date;
  public statutColor: "normal-status" | "warning-status" | "danger-status";

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
    if (usager && usager.dateNaissance !== null) {
      this.dateNaissance = new Date(usager.dateNaissance);
    }

    this.villeNaissance = (usager && usager.villeNaissance) || "";

    this.email = (usager && usager.email) || "";
    this.phone = (usager && usager.phone) || "";

    this.structureId = (usager && usager.structureId) || null;
    this.etapeDemande = (usager && usager.etapeDemande) || ETAPE_ETAT_CIVIL;

    this.historique = [];

    if (usager && usager.historique) {
      this.historique = [];
      usager.historique.forEach((decision: UsagerDecision) => {
        this.historique.push(new Decision(decision));
      });

      this.historique.sort((a, b) => {
        return b.dateDecision.getTime() - a.dateDecision.getTime();
      });
    }

    this.rdv = (usager && new Rdv(usager.rdv)) || new Rdv();

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

    this.preference = (usager && usager.preference) || {
      email: false,
      phone: false,
      phoneNumber: new RegExp(regexp.mobilePhone).test(this.phone)
        ? this.phone
        : "",
    };

    this.options = (usager && new Options(usager.options)) || new Options();
    this.decision = (usager && new Decision(usager.decision)) || new Decision();

    this.typeDom = (usager && usager.typeDom) || "PREMIERE";

    this.isActif = false;
    this.dayBeforeEnd = 365;
    this.dateToDisplay = null;
    this.statutColor = "normal-status";

    // Actuellement actif
    if (this.decision.statut === "VALIDE") {
      this.dateToDisplay = this.decision.dateFin;
      this.isActif = true;
    }
    // En cours de renouvellement
    if (
      this.decision.statut === "INSTRUCTION" &&
      this.typeDom === "RENOUVELLEMENT"
    ) {
      this.isActif = true;
      this.dateToDisplay = this.historique[0].dateFin;
    }
    // En attente de décision de renouvellement
    if (
      this.decision.statut === "ATTENTE_DECISION" &&
      this.typeDom === "RENOUVELLEMENT"
    ) {
      this.isActif = true;
      this.dateToDisplay = this.historique[1].dateFin;
    }

    if (this.isActif) {
      const today = new Date();
      const msPerDay: number = 1000 * 60 * 60 * 24;
      const start: number = today.getTime();
      const end: number = this.dateToDisplay.getTime();

      this.dayBeforeEnd = Math.ceil((end - start) / msPerDay);

      if (this.dayBeforeEnd < 15) {
        this.statutColor = "danger-status";
      } else if (this.dayBeforeEnd > 15 && this.dayBeforeEnd < 60) {
        this.statutColor = "warning-status";
      }
    }

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
