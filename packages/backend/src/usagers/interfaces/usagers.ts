import { Document } from "mongoose";
import { UsagerPreferenceContact } from "../../database/entities/usager/UsagerPreferenceContact.type";
import { AyantDroit } from "./ayant-droit";
import { Decision } from "./decision";
import { Doc } from "./doc";
import { Entretien } from "./entretien";
import { Options } from "./options";
import { Rdv } from "./rdv";

export interface Usager extends Document {
  id: number;
  nom: string;
  prenom: string;
  surnom: string;
  sexe: string;
  langue: string;

  customId: string;

  dateNaissance: Date;
  villeNaissance: string;

  email: string;
  phone: string;
  preference: UsagerPreferenceContact;

  ayantsDroits: AyantDroit[];

  structureId: number;
  etapeDemande: number;

  decision: Decision;
  historique: Decision[];

  rdv: Rdv;
  entretien: Entretien;

  docs: Doc[];

  docsPath: string[];

  lastInteraction: {
    [key: string]: any;
    dateInteraction: Date;
    enAttente: boolean;
    courrierIn: number;
    recommandeIn: number;
    colisIn: number;
  };

  typeDom: string;
  datePremiereDom: Date;

  options: Options;
}
