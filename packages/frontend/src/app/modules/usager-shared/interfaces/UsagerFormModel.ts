import { Entretien, Rdv, Decision, Options } from ".";
import {
  UsagerLight,
  UsagerSexe,
  UsagerNote,
  UsagerAyantDroit,
  UsagerDecision,
  UsagerTypeDom,
  UsagerImport,
  UsagerEcheanceInfos,
  UsagerRdvInfos,
} from "../../../../_common/model";
import { INTERACTIONS_IN_AVAILABLE } from "../../../../_common/model/interaction/constants";
import {
  ETAPE_ETAT_CIVIL,
  USAGER_DECISION_STATUT_LABELS,
  USAGER_DECISION_STATUT_COLORS,
} from "../../../../_common/model/usager/_constants";
import { regexp } from "../../../shared/validators";
import {
  UsagersFilterCriteria,
  usagersFilter,
} from "../../usagers/components/manage/usager-filter";
import { getEcheanceInfos, getRdvInfos, getUrlUsagerProfil } from "../utils";

export class UsagerFormModel implements UsagerLight {
  public ref: number;
  public customRef: string | null;
  public nom: string;
  public prenom: string;
  public surnom: string;

  public sexe: UsagerSexe;
  public langue: string;

  // Naissance
  public dateNaissance: Date;
  public villeNaissance: string;

  // Infos de contact
  public email: string;
  public phone: string;

  // Préférence d'envoi de notifs
  public preference: {
    phone: boolean;
    phoneNumber?: string;
  };

  public structureId: number | null;
  public etapeDemande: number;

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
  public isActif: boolean;
  public isAyantDroit: boolean;

  public echeanceInfos: UsagerEcheanceInfos;
  public rdvInfos: UsagerRdvInfos;

  public totalInteractionsEnAttente: number;

  // Dates à afficher sur le manage, couleur selon le statut

  public usagerProfilUrl: string;

  public statusInfos: {
    text: string;
    color: string;
  };

  constructor(usager?: UsagerLight, filterCriteria?: UsagersFilterCriteria) {
    this.notes = (usager && usager.notes) || [];
    this.notes.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

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

    this.ayantsDroits = (usager && usager.ayantsDroits) || [];
    this.ayantsDroitsExist = this.ayantsDroits && this.ayantsDroits.length > 0;

    this.typeDom = (usager && usager.typeDom) || "PREMIERE_DOM";
    this.import = (usager && usager.import) || null;

    if (usager && usager.datePremiereDom !== null) {
      this.datePremiereDom = new Date(usager.datePremiereDom);
    }

    this.historique =
      usager && usager.historique
        ? usager.historique.map((decision: UsagerDecision) => {
            return new Decision(decision);
          })
        : [];

    this.historique.sort((a, b) => {
      return b.dateDecision.getTime() - a.dateDecision.getTime();
    });

    this.lastInteraction = {
      dateInteraction: null,
      enAttente: false,
      courrierIn: 0,
      recommandeIn: 0,
      colisIn: 0,
    };

    if (usager && usager.lastInteraction) {
      this.lastInteraction = {
        dateInteraction: usager.lastInteraction.dateInteraction
          ? new Date(usager.lastInteraction.dateInteraction)
          : null,
        enAttente: usager.lastInteraction.enAttente || false,
        courrierIn: usager.lastInteraction.courrierIn || 0,
        recommandeIn: usager.lastInteraction.recommandeIn || 0,
        colisIn: usager.lastInteraction.colisIn || 0,
      };
    }

    this.preference = (usager && usager.preference) || {
      phone: false,
      phoneNumber: new RegExp(regexp.mobilePhone).test(this.phone)
        ? this.phone
        : "",
    };

    this.rdv = new Rdv((usager && usager.rdv) || null);
    this.entretien = new Entretien((usager && usager.entretien) || null);
    this.options = new Options((usager && usager.options) || null);
    this.decision = new Decision((usager && usager.decision) || null);

    //
    //
    // FRONTEND VARIABLES
    //

    // Affichage du statut
    this.statusInfos = {
      text: USAGER_DECISION_STATUT_LABELS[this.decision.statut],
      color: USAGER_DECISION_STATUT_COLORS[this.decision.statut],
    };

    this.echeanceInfos = getEcheanceInfos(usager);
    this.isActif = this.echeanceInfos.isActif;

    this.rdvInfos = getRdvInfos(usager);

    // Url vers laquelle rediriger
    this.usagerProfilUrl = getUrlUsagerProfil(usager);

    this.totalInteractionsEnAttente = 0;
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
      delete this.langue;
      delete this.phone;
      delete this.villeNaissance;
      delete this.rdv;
    }
  }
}
