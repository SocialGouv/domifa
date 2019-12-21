import { Document } from "mongoose";
import { Interaction } from "../../interactions/interactions.interface";
import { AyantDroit } from "./ayant-droit";
import { Decision } from "./decision";
import { Doc } from "./doc";
import { Entretien } from "./entretien";
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

  agent: string;

  decision: Decision;
  historique: Decision[];

  rdv: Rdv;
  entretien: Entretien;

  docs: Doc[];
  docsPath: string[];

  lastInteraction: {
    nbCourrier: number;
    dateInteraction: Date;
  };

  interactions: Interaction[];

  typeDom: string;
  datePremiereDom: Date;

  transfert: {};
}
