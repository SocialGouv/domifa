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
  public statut: string;

  public historique: string;

  public preference: {
    email: boolean;
    phone: boolean;
    aucun: boolean;
  };

  public lastInteraction: LastInteraction;

  public decision: any;

  public dateNaissancePicker: any;

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

      console.log("usager.dateNaissance");
      console.log(usager.dateNaissance);
      console.log("this.dateNaissance");
      console.log(this.dateNaissance);
      console.log("this.dateNaissance 2");
      console.log(this.dateNaissance);
      this.dateNaissancePicker = {
        day: this.dateNaissance.getDate(),
        month: this.dateNaissance.getMonth() + 1,
        year: this.dateNaissance.getFullYear()
      };

      console.log("this.dateNaissancePicker");
      console.log(this.dateNaissancePicker);
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

    this.decision = (usager && usager.decision) || new Decision({});
  }
}
