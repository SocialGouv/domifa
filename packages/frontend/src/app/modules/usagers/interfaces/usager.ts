import { Rdv } from '../interfaces/rdv';
import { AyantDroit } from './ayant-droit';
import { Decision } from './decision';
import { Doc } from './document';
import { Entretien } from './entretien';

export class Usager {

  public id: number;
  public nom: string;
  public prenom: string;
  public sexe: string;
  public dateNaissance: Date;
  public villeNaissance: string;

  public email: string;
  public phone: string;
  public contactPreference: string;

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
    mail: boolean,
    phone: boolean
  };


  public lastInteraction: {
    nbCourrier: number,
    courrierIn: Date,
    courrierOut: Date,
    recommandeIn: Date,
    recommandeOut: Date,
    appel: Date,
    visite: Date,
  };


  public decision: any;

  public dateNaissancePicker: any;

  constructor(usager?: any) {

    this.id = usager && usager.id || 0;

    this.nom = usager && usager.nom || null;
    this.prenom = usager && usager.prenom || null;
    this.sexe = usager && usager.sexe || 'homme';
    this.dateNaissance = usager && new Date(usager.dateNaissance) || null;

    this.dateNaissancePicker = usager && usager.dateNaissance ?
    { day: this.dateNaissance.getDate(), month: this.dateNaissance.getMonth() + 1, year: this.dateNaissance.getFullYear() } : {};

    this.villeNaissance = usager && usager.villeNaissance || null;

    this.email =  usager && usager.email || null;
    this.phone = usager && usager.phone || null;
    this.contactPreference =  usager && usager.contactPreference || null;
    this.docs =  usager && usager.docs || [];

    this.agent =  usager && usager.agent || null;

    this.structure = usager && usager.structure || 2;
    this.etapeDemande =  usager && usager.etapeDemande || 0;
    this.historique = usager && usager.historique || null;

    this.rdv = usager && new Rdv(usager.rdv) || new Rdv({});
    this.lastInteraction = usager && usager.lastInteraction || {
      appel: null,
      courrierIn: null,
      courrierOut: null,
      nbCourrier: 0,
      recommandeIn: null,
      recommandeOut: null,
      visite: null,
    };;

    this.entretien = usager && new Entretien(usager.entretien) || new Entretien({});

    this.docs = usager && usager.docs || [];

    this.ayantsDroitsExist = usager && usager.ayantsDroitsExist || false;
    this.ayantsDroits = usager && usager.ayantsDroits || [];

    this.preference = usager && usager.preference || {
      mail: false,
      phone: false
    };

    this.decision = usager && usager.decision || new Decision({});

  }
}
