import { isToday } from "../../../shared/bootstrap-util";
import { Rdv } from "../interfaces/rdv";
import { AyantDroit } from "./ayant-droit";
import { Decision } from "./decision";
import { Doc } from "./document";
import { Entretien } from "./entretien";

export class Usager {
  public id: number;
  public nom: string;
  public nomComplet: string;
  public prenom: string;
  public surnom: string;

  public sexe: string;
  public dateNaissance: Date;
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

  public typeDom: string;

  public historique: Decision[];

  public preference: {
    email: boolean;
    phone: boolean;
    aucun: boolean;
  };

  public lastInteraction: {
    nbCourrier: number;
    dateInteraction: Date;
  };

  public dayBeforeEnd: number;

  public decision: any;

  public dateNaissancePicker: any;

  public interactionsToday: {
    appel: boolean;
    visite: boolean;
  };

  constructor(usager?: any) {
    this.id = (usager && usager.id) || 0;
    this.sexe = (usager && usager.sexe) || "homme";
    this.nom = (usager && usager.nom) || "";
    this.prenom = (usager && usager.prenom) || "";

    this.nomComplet =
      (this.sexe === "homme" ? "M. " : "Mme ") +
      this.prenom +
      " " +
      this.nom.toUpperCase();

    this.surnom = (usager && usager.surnom) || "";
    this.dateNaissance = null;
    this.dateNaissancePicker = {};
    if (usager && usager.dateNaissance !== null) {
      this.dateNaissance = new Date(usager.dateNaissance);
      this.dateNaissancePicker = {
        day: this.dateNaissance.getDate(),
        month: this.dateNaissance.getMonth() + 1,
        year: this.dateNaissance.getFullYear()
      };
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
    this.lastInteraction = (usager && usager.lastInteraction) || {
      dateInteraction: null,
      nbCourrier: 0
    };

    this.entretien =
      (usager && new Entretien(usager.entretien)) || new Entretien({});

    this.docs = (usager && usager.docs) || [];

    this.ayantsDroits = (usager && usager.ayantsDroits) || [];

    this.ayantsDroitsExist = this.ayantsDroits && this.ayantsDroits.length > 0;

    this.preference = (usager && usager.preference) || {
      aucun: false,
      email: false,
      phone: false
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
      appel: null,
      visite: null
    };

    this.typeDom = (usager && usager.typeDom) || "PREMIERE";
  }
}
