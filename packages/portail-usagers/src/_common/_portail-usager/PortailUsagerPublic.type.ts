import {
  UsagerAyantDroit,
  UsagerDecision,
  UsagerLastInteractions,
  UsagerOptions,
  UsagerPreferenceContact,
  UsagerRdv,
  UsagerSexe,
  UsagerTypeDom,
} from "../usager";
import { Telephone } from "../common";
import { AppEntity } from "../_core";

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
  phone?: string;
  telephone: Telephone;

  preference?: UsagerPreferenceContact;

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
  lastInteraction: UsagerLastInteractions;

  options: UsagerOptions;
};
