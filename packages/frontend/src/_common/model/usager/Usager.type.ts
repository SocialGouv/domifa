import { UsagerImport } from "./UsagerImport.type";
import { AppEntity } from "../../../_common/model";
import { UsagerAyantDroit } from "./UsagerAyantDroit.type";
import { UsagerDecision } from "./UsagerDecision.type";
import { UsagerDoc } from "./UsagerDoc.type";
import { UsagerEntretien } from "./UsagerEntretien.type";
import { UsagerLastInteractions } from "./UsagerLastInteractions.type";
import { UsagerOptions } from "./UsagerOptions.type";
import { UsagerPreferenceContact } from "./UsagerPreferenceContact.type";
import { UsagerRdv } from "./UsagerRdv.type";
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
  phone?: string;

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

  // DOCUMENTS
  docs: UsagerDoc[];

  docsPath: string[]; // TODO: fusionner avec docs

  options: UsagerOptions;

  // Variables de front
  dateToDisplay?: Date | null;
  usagerProfilUrl?: string;
};
