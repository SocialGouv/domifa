import {
  AppEntity,
  Telephone,
  UsagerEcheanceInfos,
  UsagerRdvInfos,
} from "../../../_common/model";
import { UsagerEntretien } from "./entretien";
import { UsagerAyantDroit } from "./ayant-droit/UsagerAyantDroit.type";
import { UsagerDecision } from "./decision/types/UsagerDecision.type";

import { UsagerImport } from "./UsagerImport.type";
import { UsagerLastInteractions } from "./UsagerLastInteractions.type";
import { UsagerNote } from "./UsagerNote.type";
import { UsagerOptions } from "./options/UsagerOptions.type";

import { UsagerTypeDom } from "./UsagerTypeDom.type";
import { UsagerRdv, UsagerSexe } from "@domifa/common";

export type Usager = AppEntity & {
  ref: number; // unique par structure
  customRef: string | null; // valeur par défaut: 'ref'
  structureId: number;

  // ETAT CIVIL
  nom: string;
  prenom: string;
  surnom: string | null;
  sexe: UsagerSexe;

  dateNaissance: Date;
  villeNaissance: string;
  langue?: string;

  // CONTACT
  email?: string;
  telephone: Telephone;
  contactByPhone: boolean;

  // AYANT-DROIT
  ayantsDroits: UsagerAyantDroit[];

  // FORMULAIRE
  etapeDemande: number;
  rdv: UsagerRdv;
  entretien: UsagerEntretien;
  // INFOS DOMICILIATION
  typeDom: UsagerTypeDom;
  datePremiereDom: Date;
  import?: UsagerImport;

  // DECISIONS
  decision: UsagerDecision;

  // visible history
  historique: UsagerDecision[];

  // INTERACTIONS
  lastInteraction: UsagerLastInteractions;

  options: UsagerOptions;
  numeroDistribution: string | null;

  pinnedNote: Partial<UsagerNote> | null;

  // Variables de front
  echeanceInfos?: UsagerEcheanceInfos;
  rdvInfos?: UsagerRdvInfos;
  usagerProfilUrl?: string;
  nbNotes?: number;
};
