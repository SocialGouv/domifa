import {
  AppEntity,
  Telephone,
  UsagerEcheanceInfos,
  UsagerRdvInfos,
} from "../../../_common/model";
import { UsagerEntretien } from "./entretien";
import { UsagerAyantDroit } from "./UsagerAyantDroit.type";
import { UsagerDecision } from "./decision/UsagerDecision.type";

import { UsagerImport } from "./UsagerImport.type";
import { UsagerLastInteractions } from "./UsagerLastInteractions.type";
import { UsagerNote } from "./UsagerNote.type";
import { UsagerOptions } from "./options/UsagerOptions.type";
import { UsagerPreferenceContact } from "./UsagerPreferenceContact.type";
import { UsagerRdv } from "./rdv/UsagerRdv.type";
import { UsagerSexe } from "./UsagerSexe.type";
import { UsagerTypeDom } from "./UsagerTypeDom.type";

export type Usager = AppEntity & {
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
  langue?: string;

  // CONTACT
  email?: string;
  telephone: Telephone;

  preference?: UsagerPreferenceContact;

  // AYANT-DROIT
  ayantsDroits: UsagerAyantDroit[];

  // FORMULAIRE
  etapeDemande: number;
  rdv: UsagerRdv;
  entretien: UsagerEntretien;

  // INFOS DOMICILIATION
  typeDom: UsagerTypeDom;
  datePremiereDom?: Date;
  import?: UsagerImport;

  // DECISIONS
  decision: UsagerDecision;

  // visible history
  historique: UsagerDecision[];

  // INTERACTIONS
  lastInteraction: UsagerLastInteractions;

  options: UsagerOptions;

  // Variables de front
  echeanceInfos?: UsagerEcheanceInfos;
  rdvInfos?: UsagerRdvInfos;
  usagerProfilUrl?: string;

  notes: UsagerNote[];
};
