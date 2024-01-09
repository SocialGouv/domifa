import { AppEntity } from "../_core/AppEntity.type";

import { UsagerImport } from "./UsagerImport.type";
import { UsagerNote } from "./UsagerNote.type";

import { Telephone } from "../telephone/Telephone.type";
import {
  UsagerLastInteraction,
  UsagerEntretien,
  UsagerRdv,
  UsagerSexe,
  UsagerAyantDroit,
  UsagerTypeDom,
  UsagerDecision,
  UsagerOptions,
} from "@domifa/common";

export type Usager = AppEntity & {
  ref: number; // unique par structure
  customRef: string; // valeur par défaut: 'ref'
  structureId: number;

  // ETAT CIVIL
  nom: string;
  prenom: string;
  surnom: string | null;
  sexe: UsagerSexe;

  dateNaissance: Date;
  villeNaissance: string;
  langue: string | null;

  // CONTACT
  email: string | null;

  telephone: Telephone;

  ayantsDroits: UsagerAyantDroit[];

  etapeDemande: number;
  rdv: UsagerRdv | null;
  entretien: UsagerEntretien;
  pinnedNote: Partial<UsagerNote> | null;

  // INFOS DOMICILIATION
  typeDom: UsagerTypeDom;
  datePremiereDom: Date | null;
  import?: UsagerImport;
  contactByPhone: boolean;
  // DECISIONS
  decision: UsagerDecision;

  // visible history
  historique: UsagerDecision[];

  // Numéro de TSA pour le tri avant arrivée par la Poste
  numeroDistribution: string | null;

  // INTERACTIONS
  lastInteraction: UsagerLastInteraction;
  options: UsagerOptions;

  migrated?: boolean;
};
