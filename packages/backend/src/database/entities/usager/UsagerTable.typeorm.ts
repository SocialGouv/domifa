import { Column, Entity, Generated, Index } from "typeorm";
import { UsagerSexe } from ".";

import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { UsagerAyantDroit } from "./UsagerAyantDroit.type";
import { UsagerDecision } from "./UsagerDecision.type";
import { UsagerDoc } from "./UsagerDoc.type";
import { UsagerEntretien } from "./UsagerEntretien.type";
import { UsagerLastInteractions } from "./UsagerLastInteractions.type";
import { UsagerOptions } from "./UsagerOptions.type";
import { UsagerPG } from "./UsagerPG.type";
import { UsagerPreferenceContact } from "./UsagerPreferenceContact.type";
import { UsagerRdv } from "./UsagerRdv.type";
import { UsagerTypeDom } from "./UsagerTypeDom.type";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "usager" })
export class UsagerTable
  extends AppTypeormTable<UsagerTable>
  implements UsagerPG {
  //
  // ETAT-CIVIL
  @Column({ type: "text", nullable: true })
  public _id: any; // obsolete mongo id: use `uuid` instead

  @Column({ type: "integer" }) // Non unique, car le compteur est défini par structure
  public id: number;

  @Column({ type: "text", nullable: true })
  public customId: string;

  @Column({ type: "text", nullable: true })
  // @OneToOne(() => Structure, (structure) => structure.id)
  public structureId: number;

  //
  // ETAT-CIVIL
  @Column({ type: "text" })
  public nom: string;

  @Column({ type: "text" })
  public prenom: string;

  @Column({ type: "text", nullable: true })
  public surnom: string;

  @Column({ type: "text" })
  public sexe: UsagerSexe;

  @Column({ type: "timestamptz" })
  public dateNaissance: Date;

  @Column({ type: "text" })
  public villeNaissance: string;

  @Column({ type: "text", nullable: true })
  public langue: string;

  //
  // INFORMATIONS DE CONTACT
  @Column({ type: "text", nullable: true })
  public email: string;

  @Column({ type: "text", nullable: true })
  public phone: string;

  @Column({
    type: "jsonb",
    nullable: true,
    default: '{"email": false, "phone": false, "aucun": true}',
  })
  public preference: UsagerPreferenceContact;

  //
  // DOMICILIATION
  @Column({ type: "timestamptz", nullable: true })
  public datePremiereDom: Date;

  @Column({ type: "text", nullable: true, default: "INSTRUCTION" })
  public typeDom: UsagerTypeDom;

  @Column({ type: "jsonb" })
  public decision: UsagerDecision;

  @Column({ type: "jsonb" })
  public historique: UsagerDecision[];

  //
  // AYANTS DROITS
  @Column({ type: "jsonb", nullable: true })
  public ayantsDroits: UsagerAyantDroit[]; // TODO: déplacer dans une entité ?

  //
  // INTERACTIONS
  @Column({
    type: "jsonb",
    default:
      "{ dateInteraction: now(), enAttente: false, courrierIn: 0, recommandeIn: 0, colisIn: 0};",
  })
  public lastInteraction: UsagerLastInteractions;

  //
  // DOCUMENTS
  @Column({ type: "jsonb", nullable: true })
  public docs: UsagerDoc[];

  @Column({ type: "jsonb", nullable: true }) // TODO: fusionner avec Docs
  public docsPath: string[];

  //
  // FORMULAIRE
  @Column({ type: "integer", default: 0 })
  public etapeDemande: number;

  @Column({ type: "jsonb", nullable: true })
  public rdv: UsagerRdv;

  @Column({
    type: "jsonb",
    default:
      "{ accompagnement: null, accompagnementDetail: null, cause: null, causeDetail: null, commentaires: null, domiciliation: null, liencommune: null, pourquoi: null, pourquoiDetail: null, rattachement: null, raison: null, raisonDetail: null, residence: null, residenceDetail: null, revenus: null, revenusDetail: null, typeMenage: null }",
  })
  public entretien: UsagerEntretien;

  //
  // TRANSFERTS / NPAI / PROCURATION
  @Column({
    type: "jsonb",
    default: "",
  })
  public options: UsagerOptions;
}
