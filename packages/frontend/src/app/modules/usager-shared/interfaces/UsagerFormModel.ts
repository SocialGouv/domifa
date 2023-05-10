import { CountryISO } from "ngx-intl-tel-input";
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
  Telephone,
} from "../../../../_common/model";
import { INTERACTIONS_IN_AVAILABLE } from "../../../../_common/model/interaction/constants";
import {
  ETAPE_ETAT_CIVIL,
  USAGER_DECISION_STATUT_LABELS,
  USAGER_DECISION_STATUT_COLORS,
} from "../../../../_common/model/usager/_constants";

import {
  UsagersFilterCriteria,
  usagersFilter,
} from "../../manage-usagers/components/usager-filter";
import { getEcheanceInfos, getRdvInfos, getUrlUsagerProfil } from "../utils";

export class UsagerFormModel {
  public ref: number;
  public customRef: string | null;
  public nom: string;
  public prenom: string;

  public surnom: string;

  public sexe: UsagerSexe;
  public langue: string | null;

  // Naissance
  public dateNaissance: Date | null;
  public villeNaissance: string | null;

  public structureId: number | null;
  public etapeDemande: number;

  // Ayants-droits
  public ayantsDroitsExist: boolean;
  public ayantsDroits: UsagerAyantDroit[];

  public decision: Decision;
  public typeDom: UsagerTypeDom; // PREMIERE / RENOUVELLEMENT
  public datePremiereDom: Date | null;

  public lastInteraction: {
    dateInteraction: Date | null;
    enAttente: boolean;
    courrierIn: number;
    recommandeIn: number;
    colisIn: number;
  };
  public totalInteractionsEnAttente: number;

  public options: Options;

  public isActif: boolean;
  public echeanceInfos: UsagerEcheanceInfos;
  public rdvInfos: UsagerRdvInfos;

  public statusInfos: {
    text: string;
    color: string;
  };
  public rdv: Rdv;

  public pinnedNote: Partial<UsagerNote> | null;

  // TODO: données utiles uniquement pour la page profil, à mettre dans un type étendu d'Usager
  public email: string;
  public telephone: Telephone;
  public contactByPhone: boolean;
  public entretien?: Entretien;
  public historique: Decision[];
  public numeroDistribution: string | null;
  public import: UsagerImport | null;

  // Dates à afficher sur le manage, couleur selon le statut
  // UNiquement pour la recherche
  public usagerProfilUrl: string;
  public searchResultProcuration: boolean;
  public searchResultAyantDroit: boolean;

  constructor(usager?: UsagerLight, filterCriteria?: UsagersFilterCriteria) {
    this.pinnedNote = (usager && usager.pinnedNote) || null;

    this.ref = (usager && usager.ref) || 0;
    this.customRef = (usager && usager.customRef) || null;

    this.sexe = (usager && usager.sexe) || "homme";
    this.nom = (usager && usager.nom) || "";
    this.prenom = (usager && usager.prenom) || "";
    this.langue = (usager && usager.langue) || "";
    this.numeroDistribution = (usager && usager.numeroDistribution) || null;

    this.surnom = (usager && usager.surnom) || "";

    this.dateNaissance = null;
    if (usager && usager.dateNaissance) {
      this.dateNaissance = new Date(usager.dateNaissance);
    }

    this.villeNaissance = (usager && usager.villeNaissance) || "";

    this.email = (usager && usager.email) || "";

    this.telephone = (usager && usager.telephone) || {
      countryCode: CountryISO.France,
      numero: "",
    };

    this.structureId = (usager && usager.structureId) || null;
    this.etapeDemande = (usager && usager.etapeDemande) || ETAPE_ETAT_CIVIL;

    this.ayantsDroits = (usager && usager.ayantsDroits) || [];
    this.ayantsDroitsExist = this.ayantsDroits && this.ayantsDroits.length > 0;

    this.typeDom = (usager && usager.typeDom) || "PREMIERE_DOM";
    this.import = (usager && usager.import) || null;

    this.datePremiereDom =
      usager && usager.datePremiereDom !== null
        ? new Date(usager.datePremiereDom)
        : null;

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

    this.contactByPhone = (usager && usager.contactByPhone) || false;

    this.rdv = new Rdv((usager && usager.rdv) || null);
    this.entretien = new Entretien(usager?.entretien);
    this.options = new Options(usager?.options);
    this.decision = new Decision(usager?.decision);

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

    this.searchResultAyantDroit = false;
    this.searchResultProcuration = false;

    if (filterCriteria && usager) {
      if (filterCriteria.searchString && filterCriteria.searchString !== null) {
        // if search does not match without ayant-droits, flag it as "searchResultAyantDroit"

        this.searchResultAyantDroit =
          usagersFilter.filter([usager], {
            criteria: {
              ...filterCriteria,
              searchInAyantDroits: false,
            },
          }).length === 0;

        this.searchResultProcuration =
          usagersFilter.filter([usager], {
            criteria: {
              ...filterCriteria,
              searchInProcurations: false,
            },
          }).length === 0;
      }

      this.entretien = undefined;
      this.langue = null;
      this.villeNaissance = null;
    }
  }
}
