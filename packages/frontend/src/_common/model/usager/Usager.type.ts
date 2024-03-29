import {
  AppEntity,
  Telephone,
  UsagerEcheanceInfos,
} from "../../../_common/model";
import { UsagerNote } from "./UsagerNote.type";

import {
  UsagerAyantDroit,
  UsagerRdv,
  UsagerSexe,
  UsagerTypeDom,
  UsagerLastInteraction,
  UsagerDecision,
  UsagerRdvInfos,
  UsagerOptions,
  UsagerEntretien,
  UsagerImport,
} from "@domifa/common";

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
  entretien: Partial<UsagerEntretien>;
  // INFOS DOMICILIATION
  typeDom: UsagerTypeDom;
  datePremiereDom: Date;
  import?: UsagerImport;

  // DECISIONS
  decision: UsagerDecision;

  // visible history
  historique: UsagerDecision[];

  // INTERACTIONS
  lastInteraction: UsagerLastInteraction;

  options: UsagerOptions;
  numeroDistribution: string | null;

  pinnedNote: Partial<UsagerNote> | null;

  // Variables de front
  echeanceInfos?: UsagerEcheanceInfos;
  rdvInfos?: UsagerRdvInfos;
  nbNotes?: number;
};
