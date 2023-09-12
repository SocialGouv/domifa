import { AppEntity } from "../_core/AppEntity.type";
import { UsagerEntretien } from "./entretien";
import { UsagerAyantDroit } from "./UsagerAyantDroit.type";
import { UsagerDecision } from "./UsagerDecision.type";
import { UsagerImport } from "./UsagerImport.type";
import { UsagerLastInteractions } from "./UsagerLastInteractions.type";
import { UsagerNote } from "./UsagerNote.type";
import { UsagerOptions } from "./options/UsagerOptions.type";

import { UsagerTypeDom } from "./UsagerTypeDom.type";
import { Telephone } from "../telephone/Telephone.type";
import { UsagerRdv, UsagerSexe } from "@domifa/common";

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

  // AYANT-DROIT
  ayantsDroits: UsagerAyantDroit[];

  // FORMULAIRE
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
  lastInteraction: UsagerLastInteractions;
  options: UsagerOptions;

  migrated?: boolean;
};
