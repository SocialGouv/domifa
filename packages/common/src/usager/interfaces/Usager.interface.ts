/* eslint-disable @typescript-eslint/no-explicit-any */
import { type AppEntity } from "../../_core";
import { type Telephone } from "../../telephone";
import { type UsagerOptions } from "../options";
import {
  type UsagerSexe,
  type UsagerTypeDom,
  type UsagerImport,
  UsagerDecisionStatut,
  UsagerPinnedNote,
} from "../types";
import { type UsagerAyantDroit } from "./UsagerAyantDroit.interface";
import { type UsagerDecision } from "./UsagerDecision.interface";
import { type UsagerEntretien } from "./UsagerEntretien.interface";
import { type UsagerLastInteraction } from "./UsagerLastInteraction.interface";
import { UsagerRdvInfo } from "./rdv";
import { type UsagerRdv } from "./rdv/UsagerRdv.interface";

export interface Usager extends AppEntity {
  ref: number; // unique par structure
  customRef: string | null; // valeur par défaut: 'ref'
  structureId: number;

  nom: string;
  prenom: string;
  surnom: string | null;
  sexe: UsagerSexe;

  dateNaissance: Date;
  villeNaissance: string;
  langue?: string;
  nationalite?: string;

  email?: string;
  telephone: Telephone;
  contactByPhone: boolean;

  ayantsDroits: UsagerAyantDroit[];

  etapeDemande: number;
  rdv: UsagerRdv;
  entretien: UsagerEntretien;

  typeDom: UsagerTypeDom;
  statut: UsagerDecisionStatut;

  datePremiereDom: Date;
  import?: UsagerImport;

  decision: UsagerDecision;
  historique: UsagerDecision[];
  lastInteraction: UsagerLastInteraction;

  options: UsagerOptions;
  numeroDistribution: string | null;

  pinnedNote: UsagerPinnedNote;
  referrerId?: number | null;

  nbNotes?: number;
  statusInfos?: any;
  echeanceInfos?: any;
  rdvInfo?: UsagerRdvInfo;
  migrated?: boolean;
}
