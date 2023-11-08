import { UsagerOptions } from "../usager";
import { Telephone } from "../common";
import { AppEntity } from "../_core";
import {
  UsagerSexe,
  UsagerTypeDom,
  UsagerLastInteraction,
  UsagerRdv,
  UsagerAyantDroit,
  UsagerDecision,
} from "@domifa/common";

export type PortailUsagerPublic = AppEntity & {
  ref: number; // unique par structure
  customRef: string; // valeur par défaut: 'ref'
  structureId: number;

  // ETAT CIVIL
  nom: string;
  prenom: string;
  surnom?: string;
  sexe: UsagerSexe;

  dateNaissance: Date;
  villeNaissance: string;

  // CONTACT
  email?: string;
  telephone: Telephone;
  contactByPhone: boolean;

  // AYANT-DROIT
  ayantsDroits: UsagerAyantDroit[];

  // FORMULAIRE
  etapeDemande: number;
  rdv: UsagerRdv | null;

  // INFOS DOMICILIATION
  typeDom: UsagerTypeDom;
  datePremiereDom?: Date;

  // DECISIONS
  decision: UsagerDecision;

  // visible history
  historique: UsagerDecision[];

  // INTERACTIONS
  lastInteraction: UsagerLastInteraction;

  options: UsagerOptions;
};
