import {
  UsagerDoc,
  UsagerLight,
  UsagerNote,
  UsagerSexe,
  UsagerTypeDom,
} from "../../../../../_common/model";
import { INTERACTIONS_IN_AVAILABLE } from "../../../../../_common/model/interaction/constants";
import {
  ETAPE_ETAT_CIVIL,
  USAGER_DECISION_STATUT_COLORS,
  USAGER_DECISION_STATUT_LABELS,
} from "../../../../../_common/model/usager/constants";
import { UsagerAyantDroit } from "../../../../../_common/model/usager/UsagerAyantDroit.type";
import { UsagerDecision } from "../../../../../_common/model/usager/UsagerDecision.type";
import { regexp } from "../../../../shared/validators";
import { Decision } from "../../interfaces/decision";
import { Doc } from "../../interfaces/doc";
import { Entretien } from "../../interfaces/entretien";
import { getDateToDisplay } from "../../interfaces/getDateToDisplay.service";
import { getUrlUsagerProfil } from "../../interfaces/getUrlUsagerProfil.service";
import { Options } from "../../interfaces/options";
import { Rdv } from "../../interfaces/rdv";
import { usagersFilter, UsagersFilterCriteria } from "../manage/usager-filter";
import { UsagerImport } from "./../../../../../_common/model/usager/UsagerImport.type";

export class UsagerFormModel implements UsagerLight {
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
  public notes: UsagerNote[];

  // Ayants-droits
  public ayantsDroitsExist: boolean;
  public ayantsDroits: UsagerAyantDroit[];

  // Historique des décisions et dernière décision
  public historique: UsagerDecision[];
  public decision: Decision;

  public typeDom: UsagerTypeDom; // PREMIERE / RENOUVELLEMENT
  public datePremiereDom?: Date;
  public import?: UsagerImport | null;

  public lastInteraction: {
    dateInteraction: Date;
    enAttente: boolean;
    courrierIn: number;
    recommandeIn: number;
    colisIn: number;
  };

  // TRANSFERT & PROCUS
  public options: Options;

  /***
   VARIABLES UTILES AU FRONT UNIQUEMENT
   Recherche : si la requête fait remonté un ayant-droit
  **/
  public isAyantDroit: boolean;
  public echeance: Date | null; // Echéance pour le tri
  public isActif: boolean; // Dossier actuellement actif
  public dayBeforeEnd: number;

  public totalInteractionsEnAttente: number;

  // Dates à afficher sur le manage, couleur selon le statut
  public dateToDisplay: Date;
  public usagerProfilUrl: string;

  public echeanceColor: "d-none" | "bg-warning" | "bg-danger";

  public statusInfos: {
    text: string;
    color: string;
  };

  constructor(
    usager?: Partial<UsagerLight>,
    filterCriteria?: UsagersFilterCriteria
  ) {
    this.notes = (usager && usager.notes) || [];
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

    this.typeDom = (usager && usager.typeDom) || "PREMIERE_DOM";
    this.import = (usager && usager.import) || null;

    if (usager && usager.datePremiereDom !== null) {
      this.datePremiereDom = new Date(usager.datePremiereDom);
    }

    //
    //
    // FRONTEND VARIABLES
    //
    this.totalInteractionsEnAttente = 0;
    this.isActif = false;
    this.dateToDisplay = null;
    this.dayBeforeEnd = 365;

    this.statusInfos = {
      text: USAGER_DECISION_STATUT_LABELS[this.decision.statut],
      color: USAGER_DECISION_STATUT_COLORS[this.decision.statut],
    };

    const { isActif, dateToDisplay } = getDateToDisplay(usager);

    this.isActif = isActif;
    this.dateToDisplay = dateToDisplay;
    this.usagerProfilUrl = getUrlUsagerProfil(usager);

    if (this.isActif) {
      const today = new Date();
      const msPerDay: number = 1000 * 60 * 60 * 24;
      const start: number = today.getTime();
      const end: number = this.dateToDisplay.getTime();

      this.dayBeforeEnd = Math.ceil((end - start) / msPerDay);

      this.echeanceColor = "d-none";
      if (this.dayBeforeEnd < 15) {
        this.echeanceColor = "bg-danger";
      } else if (this.dayBeforeEnd > 15 && this.dayBeforeEnd < 60) {
        this.echeanceColor = "bg-warning";
      }
    }

    INTERACTIONS_IN_AVAILABLE.forEach((interaction) => {
      this.totalInteractionsEnAttente += this.lastInteraction[interaction];
    });

    this.isAyantDroit = false;

    if (filterCriteria) {
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

      delete this.entretien;
      delete this.docs;
      delete this.langue;
      delete this.phone;
      delete this.villeNaissance;
      delete this.rdv;
    }
  }
}
