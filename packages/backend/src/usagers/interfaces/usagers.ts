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

  dateNaissance: Date;
  villeNaissance: string;

  email: string;
  phone: string;

  ayantsDroits: AyantDroit[];

  structureId: number;
  etapeDemande: number;

  datePremiereDom: Date;

  agent: string;

  decision: Decision;
  historique: Decision[];

  rdv: Rdv;
  entretien: Entretien;

  docs: Doc[];
  docsPath: string[];
  typeDecision: string;

  lastInteraction: {
    nbCourrier: number;
    dateInteraction: Date;
  };

  interactions: Interaction[];

  typeDom: string;

  transfert: boolean;
  transfertAddress: string;
}
