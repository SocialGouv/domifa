import { CountryISO } from "@khazii/ngx-intl-tel-input";
import { Entretien, Rdv, Decision, Options } from ".";
import { UsagerEcheanceInfos, Telephone } from "../../../../_common/model";

import { countStandByInteractions, getEcheanceInfos } from "../utils";
import {
  ETAPE_ETAT_CIVIL,
  USAGER_DECISION_STATUT_COLORS,
  USAGER_DECISION_STATUT_LABELS,
  UsagerSexe,
  UsagerTypeDom,
  UsagerAyantDroit,
  getRdvInfo,
  UsagerDecision,
  UsagerRdvInfo,
  UsagerNote,
  Usager,
  UsagerDecisionStatut,
} from "@domifa/common";
import { formatInternationalPhoneNumber } from "../../../shared/phone/formatInternationalPhoneNumber";

export class UsagerFormModel implements Usager {
  public ref: number;
  public customRef: string;
  public uuid: string | null;
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
  public standByInteractions: number;

  public options: Options;

  public echeanceInfos: UsagerEcheanceInfos;
  public rdvInfo: UsagerRdvInfo;

  public statusInfo: {
    text: string;
    color: string;
  };
  public rdv: Rdv;

  public pinnedNote: Pick<
    UsagerNote,
    "usagerRef" | "createdAt" | "message" | "createdBy"
  > | null;

  public email: string;
  public statut: UsagerDecisionStatut;

  public telephone: Telephone;
  public phoneNumber?: string | null;

  public contactByPhone: boolean;
  public entretien: Entretien;
  public historique: Decision[];
  public numeroDistribution: string | null;
  public nationalite: string | null;

  public nbNotes?: number = 0;
  public referrerId?: number | null;

  constructor(usager?: Usager) {
    this.pinnedNote = usager?.pinnedNote || null;
    this.ref = usager?.ref || 0;
    this.nbNotes = usager?.nbNotes || 0;
    this.uuid = usager?.uuid || null;
    this.customRef = usager?.customRef || "";
    this.sexe = usager?.sexe || "homme";
    this.nom = usager?.nom || "";
    this.prenom = usager?.prenom || "";
    this.langue = usager?.langue || "";
    this.numeroDistribution = usager?.numeroDistribution || null;
    this.referrerId = usager?.referrerId || null;
    this.surnom = usager?.surnom || "";

    this.dateNaissance = usager?.dateNaissance
      ? new Date(usager.dateNaissance)
      : null;

    this.villeNaissance = usager?.villeNaissance || "";
    this.nationalite = usager?.nationalite || "";
    this.email = usager?.email || "";

    this.telephone = (usager?.telephone as Telephone) || {
      countryCode: CountryISO.France,
      numero: "",
    };

    this.phoneNumber = formatInternationalPhoneNumber(this.telephone);

    this.etapeDemande = usager?.etapeDemande || ETAPE_ETAT_CIVIL;
    this.ayantsDroits = usager?.ayantsDroits || [];
    this.typeDom = usager?.typeDom || "PREMIERE_DOM";

    this.datePremiereDom = usager?.datePremiereDom
      ? new Date(usager.datePremiereDom)
      : null;

    this.historique = usager?.historique
      ? usager.historique.map(
          (decision: UsagerDecision) => new Decision(decision)
        )
      : [];

    this.lastInteraction = {
      dateInteraction: usager?.lastInteraction?.dateInteraction
        ? new Date(usager.lastInteraction.dateInteraction)
        : null,
      enAttente: usager?.lastInteraction?.enAttente || false,
      courrierIn: usager?.lastInteraction?.courrierIn || 0,
      recommandeIn: usager?.lastInteraction?.recommandeIn || 0,
      colisIn: usager?.lastInteraction?.colisIn || 0,
    };

    this.contactByPhone = usager?.contactByPhone || false;
    this.rdv = new Rdv(usager?.rdv || null);
    this.entretien = new Entretien(usager?.entretien);
    this.options = new Options(usager?.options);
    this.decision = new Decision(usager?.decision);
    this.statut = this.decision.statut;

    this.statusInfo = {
      text: USAGER_DECISION_STATUT_LABELS[this.decision.statut],
      color: USAGER_DECISION_STATUT_COLORS[this.decision.statut],
    };
    this.echeanceInfos = getEcheanceInfos(usager);
    this.rdvInfo = getRdvInfo({
      rdv: this.rdv,
      etapeDemande: this.etapeDemande,
    });

    this.standByInteractions = countStandByInteractions(this.lastInteraction);
  }
}
