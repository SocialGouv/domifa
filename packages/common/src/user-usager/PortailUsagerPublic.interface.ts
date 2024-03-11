import { type AppEntity } from "../_core";
import { type Telephone } from "../telephone";
import {
  type UsagerSexe,
  type UsagerAyantDroit,
  type UsagerRdv,
  type UsagerTypeDom,
  type UsagerDecision,
  type UsagerLastInteraction,
  type UsagerOptions,
} from "../usager";

export interface PortailUsagerPublic extends AppEntity {
  customRef: string; // valeur par défaut: 'ref'
  structureId: number;
  nom: string;
  prenom: string;
  surnom?: string;
  ref: number;
  sexe: UsagerSexe;

  dateNaissance: Date;
  villeNaissance: string;

  email: string | null;
  telephone: Telephone;
  contactByPhone: boolean;

  ayantsDroits: UsagerAyantDroit[];

  etapeDemande: number;
  rdv: UsagerRdv | null;

  typeDom: UsagerTypeDom;
  datePremiereDom?: Date;

  decision: UsagerDecision;
  historique: UsagerDecision[];
  lastInteraction: UsagerLastInteraction;
  options: UsagerOptions;
}
