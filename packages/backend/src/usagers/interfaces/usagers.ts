import { Document } from "mongoose";
import { InteractionDocument } from "../../interactions/interactions.interface";
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

  customId: string;

  dateNaissance: Date;
  villeNaissance: string;

  email: string;
  phone: string;

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

  interactions: InteractionDocument[];

  typeDom: string;
  datePremiereDom: Date;

  options: Options;

  migration: boolean;
}
