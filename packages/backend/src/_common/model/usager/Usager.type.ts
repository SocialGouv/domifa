import { AppEntity } from "../_core/AppEntity.type";
import { UsagerEntretien } from "./entretien";
import { UsagerAyantDroit } from "./UsagerAyantDroit.type";
import { UsagerDecision } from "./UsagerDecision.type";
import { UsagerImport } from "./UsagerImport.type";
import { UsagerLastInteractions } from "./UsagerLastInteractions.type";
import { UsagerNote } from "./UsagerNote.type";
import { UsagerOptions } from "./options/UsagerOptions.type";

import { UsagerRdv } from "./UsagerRdv.type";
import { UsagerSexe } from "./UsagerSexe.type";
import { UsagerTypeDom } from "./UsagerTypeDom.type";
import { Telephone } from "../telephone/Telephone.type";

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
  rdv: UsagerRdv;
  entretien: UsagerEntretien;

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

  notes: UsagerNote[];

  options: UsagerOptions;

  migrated: boolean;
};
