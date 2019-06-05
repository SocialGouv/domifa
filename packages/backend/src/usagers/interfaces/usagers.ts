import { Document } from 'mongoose';
import { Interaction } from '../../interactions/interactions.interface';
import { AyantDroit } from './ayant-droit';
import { Decision } from './decision';
import { Doc } from './doc';
import { Entretien } from './entretien';
import { Rdv } from './rdv';

export interface Usager extends Document {
  id: number;
  nom: string;
  prenom: string;
  sexe: string;

  dateNaissance: Date;
  villeNaissance: string;

  email: string;
  phone: string;

  ayantsDroits: AyantDroit[]

  etapeDemande: number;

  agent: string;
  historique: string;

  contactPreference: string;

  rdv: Rdv;
  entretien: Entretien;
  decision: Decision;

  docs: Doc[];
  docsPath: string[];

  lastInteraction: {
    nbCourrier: number;
    courrierIn: Date;
    courrierOut: Date;
    recommandeIn: Date;
    recommandeOut: Date;
    appel: Date;
    visite: Date;
  };

  interactions: Interaction[];

}


