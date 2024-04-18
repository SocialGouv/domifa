/* eslint-disable @typescript-eslint/no-explicit-any */
import { type AppEntity } from "../../_core";
import { type Telephone } from "../../telephone";
import { type UsagerOptions } from "../options";
import {
  type UsagerSexe,
  type UsagerTypeDom,
  type UsagerImport,
} from "../types";
import { type UsagerAyantDroit } from "./UsagerAyantDroit.interface";
import { type UsagerDecision } from "./UsagerDecision.interface";
import { type UsagerEntretien } from "./UsagerEntretien.interface";
import { type UsagerLastInteraction } from "./UsagerLastInteraction.interface";
import { type UsagerNote } from "./UsagerNote.interface";
import { type UsagerRdv } from "./UsagerRdv.interface";

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
  datePremiereDom: Date;
  import?: UsagerImport;

  decision: UsagerDecision;
  historique: UsagerDecision[];
  lastInteraction: UsagerLastInteraction;

  options: UsagerOptions;
  numeroDistribution: string | null;

  pinnedNote: Pick<
    UsagerNote,
    "createdAt" | "usagerRef" | "message" | "createdBy"
  > | null;

  nbNotes?: number;
  statusInfos?: any;
  echeanceInfos?: any;
  rdvInfos?: any;
  migrated?: boolean;
}
