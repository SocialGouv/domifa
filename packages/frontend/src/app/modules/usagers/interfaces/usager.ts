import { isToday } from "../../../shared/bootstrap-util";
import { Rdv } from "../interfaces/rdv";
import { AyantDroit } from "./ayant-droit";
import { Decision } from "./decision";
import { Doc } from "./document";
import { Entretien } from "./entretien";
import { LastInteraction } from "./last-interaction";

export class Usager {
  public id: number;
  public nom: string;
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

  public agent: string;

  public historique: string;

  public preference: {
    email: boolean;
    phone: boolean;
    aucun: boolean;
  };

  public lastInteraction: LastInteraction;

  public dayBeforeEnd: number;
  public decision: any;

  public dateNaissancePicker: any;

  public interactionsToday: {
    appel: boolean;
    visite: boolean;
  };

  constructor(usager?: any) {
    this.id = (usager && usager.id) || 0;

    this.nom = (usager && usager.nom) || "";
    this.prenom = (usager && usager.prenom) || "";
    this.surnom = (usager && usager.surnom) || "";
    this.sexe = (usager && usager.sexe) || "homme";
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

    this.agent = (usager && usager.agent) || "";

    this.structure = (usager && parseInt(usager.structure, 10)) || 2;
    this.etapeDemande = (usager && parseInt(usager.etapeDemande, 10)) || 0;
    this.historique = (usager && usager.historique) || "";

    this.rdv = (usager && new Rdv(usager.rdv)) || new Rdv({});
    this.lastInteraction =
      (usager && new LastInteraction(usager.lastInteraction)) ||
      new LastInteraction({});

    this.entretien =
      (usager && new Entretien(usager.entretien)) || new Entretien({});

    this.docs = (usager && usager.docs) || [];

    this.ayantsDroitsExist = (usager && usager.ayantsDroitsExist) || false;
    this.ayantsDroits = (usager && usager.ayantsDroits) || [];

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
      appel: isToday(new Date(this.lastInteraction.appel)),
      visite: isToday(new Date(this.lastInteraction.visite))
    };
  }
}
