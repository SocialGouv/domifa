import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { UsagerDoc, UsagerPG, UsagerSexe } from "../../../../../_common/model";
import { UsagerAyantDroit } from "../../../../../_common/model/usager/UsagerAyantDroit.type";
import { UsagerDecision } from "../../../../../_common/model/usager/UsagerDecision.type";
import { formatDateToNgb } from "../../../../shared/bootstrap-util";
import { Decision } from "../../interfaces/decision";
import { Doc } from "../../interfaces/doc";
import { Entretien } from "../../interfaces/entretien";
import { Options } from "../../interfaces/options";
import { Rdv } from "../../interfaces/rdv";

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
    aucun: boolean;
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

  // VARIABLES UTILES AU FRONT UNIQUEMENT

  // Recherche : si la requête fait remonté un ayant-droit
  public isAyantDroit: boolean;

  public dayBeforeEnd: number;

  public options: Options;

  constructor(usager?: Partial<UsagerPG>, searchString?: string) {
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

    this.structureId = (usager && usager.structureId) || 2;
    this.etapeDemande = (usager && usager.etapeDemande) || 0;

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

    this.isAyantDroit = usager?.ayantsDroits?.length !== 0 || false;

    this.ayantsDroitsExist = this.ayantsDroits && this.ayantsDroits.length > 0;

    this.preference = usager?.preference
      ? {
          ...usager.preference,
          aucun: !usager.email && !usager.phone,
        }
      : {
          aucun: false,
          email: false,
          phone: false,
        };

    this.decision =
      (usager && new Decision(usager.decision)) || new Decision({});

    this.dayBeforeEnd = 365;

    if (this.decision.dateFin) {
      const today = new Date();
      const msPerDay: number = 1000 * 60 * 60 * 24;
      const start: number = today.getTime();
      const end: number = this.decision.dateFin.getTime();

      this.dayBeforeEnd = Math.ceil((end - start) / msPerDay);
    }

    this.typeDom = (usager && usager.typeDom) || "PREMIERE";

    this.options = (usager && new Options(usager.options)) || new Options({});

    this.isAyantDroit = false;
    if (searchString && searchString !== null) {
      const substring = searchString.toUpperCase();
      let customRef = this.customRef;

      if (!this.customRef || this.customRef === null) {
        customRef = "";
      }

      this.isAyantDroit =
        !this.ref.toString().toUpperCase().includes(substring) &&
        !customRef.toUpperCase().includes(substring) &&
        !this.nom.toUpperCase().includes(substring) &&
        !this.prenom.toUpperCase().includes(substring) &&
        !this.surnom.toUpperCase().includes(substring);
    }
  }
}
