import { Telephone } from "./../telephone/Telephone.type";
import {
  UsagerAyantDroit,
  UsagerDecision,
  UsagerLastInteractions,
  UsagerOptions,
  UsagerRdv,
  UsagerSexe,
  UsagerTypeDom,
} from "..";
import { AppEntity } from "../_core";

export type PortailUsagerPublic = AppEntity & {
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
  email: string | null;
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
  lastInteraction: UsagerLastInteractions;

  options: UsagerOptions;
};
