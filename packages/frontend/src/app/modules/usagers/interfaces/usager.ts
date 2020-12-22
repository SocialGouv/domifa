import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { formatDateToNgb } from "../../../shared/bootstrap-util";
import { Rdv } from "../interfaces/rdv";
import { AyantDroit } from "./ayant-droit";
import { Decision } from "./decision";
import { Doc } from "./doc";
import { Entretien } from "./entretien";
import { Options } from "./options";

export class Usager {
  public id: number;
  public customId: string;
  public nom: string;
  public nomComplet: string;
  public prenom: string;
  public surnom: string;

  public sexe: string;
  public langue: string;
  public dateNaissance: Date | null;
  public villeNaissance: string;

  public email: string;
  public phone: string;

  public structure: number;
  public etapeDemande: number;

  public docs: Doc[];
  public entretien: Entretien;
  public rdv: Rdv;
  public ayantsDroitsExist: boolean;
  public ayantsDroits: AyantDroit[];

  // Recherche : si la requête fait remonté un ayant-droit
  public isAyantDroit: boolean;

  public typeDom: string;

  public historique: Decision[];

  public preference: {
    email: boolean;
    phone: boolean;
    aucun: boolean;
  };

  public lastInteraction: {
    dateInteraction: Date;
    enAttente: boolean;
    courrierIn: number;
    recommandeIn: number;
    colisIn: number;
  };

  public dayBeforeEnd: number;

  public decision: Decision;

  public dateNaissancePicker: NgbDateStruct | null;

  public interactionsToday: {
    appel: boolean;
    visite: boolean;
  };

  public options: Options;

  constructor(usager?: any, search?: string) {
    this.id = (usager && usager.id) || 0;
    this.customId = (usager && usager.customId) || null;
    this.sexe = (usager && usager.sexe) || "homme";
    this.nom = (usager && usager.nom) || "";
    this.prenom = (usager && usager.prenom) || "";
    this.langue = (usager && usager.langue) || "";

    this.nomComplet =
      (this.sexe === "homme" ? "M. " : "Mme ") +
      this.prenom +
      " " +
      this.nom.toUpperCase();

    this.surnom = (usager && usager.surnom) || "";

    this.dateNaissance = null;

    this.historique = [];
    this.dateNaissancePicker = null;
    if (usager && usager.dateNaissance !== null) {
      this.dateNaissance = new Date(usager.dateNaissance);
      this.dateNaissancePicker = formatDateToNgb(this.dateNaissance);
    }

    this.villeNaissance = (usager && usager.villeNaissance) || "";

    this.email = (usager && usager.email) || "";
    this.phone = (usager && usager.phone) || "";
    this.docs = (usager && usager.docs) || [];

    this.structure = (usager && parseInt(usager.structure, 10)) || 2;
    this.etapeDemande = (usager && parseInt(usager.etapeDemande, 10)) || 0;

    if (usager && usager.historique) {
      this.historique = [];
      usager.historique.forEach((decision: Decision) => {
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
        enAttente: usager.lastInteraction.enAttente || 0,
        courrierIn: usager.lastInteraction.courrierIn || 0,
        recommandeIn: usager.lastInteraction.recommandeIn || 0,
        colisIn: usager.lastInteraction.colisIn,
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

    this.isAyantDroit = (usager && usager.isAyantDroit) || false;

    this.ayantsDroitsExist = this.ayantsDroits && this.ayantsDroits.length > 0;

    this.preference = (usager && usager.preference) || {
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

    this.interactionsToday = {
      appel: false,
      visite: false,
    };

    this.typeDom = (usager && usager.typeDom) || "PREMIERE";

    this.options = (usager && new Options(usager.options)) || new Options({});

    this.isAyantDroit = false;
    if (search && search !== null) {
      const substring = search.toUpperCase();
      let customId = this.customId;

      if (!this.customId || this.customId === null) {
        customId = "";
      }

      this.isAyantDroit =
        !this.id.toString().toUpperCase().includes(substring) &&
        !customId.toUpperCase().includes(substring) &&
        !this.nom.toUpperCase().includes(substring) &&
        !this.prenom.toUpperCase().includes(substring) &&
        !this.surnom.toUpperCase().includes(substring);
    }
  }
}
