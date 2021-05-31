import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from "typeorm";
import {
  Usager,
  UsagerDoc,
  UsagerEntretien,
  UsagerLastInteractions,
  UsagerOptions,
  UsagerPreferenceContact,
  UsagerRdv,
  UsagerSexe,
  UsagerTypeDom,
  UsagerVisibleHistoryDecision,
} from "../../../_common/model";
import { UsagerAyantDroit } from "../../../_common/model/usager/UsagerAyantDroit.type";
import { UsagerDecision } from "../../../_common/model/usager/UsagerDecision.type";
import { StructureTable } from "../structure/StructureTable.typeorm";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "usager" })
@Unique(["structureId", "ref"])
export class UsagerTable
  extends AppTypeormTable<UsagerTable>
  implements Usager {
  // ETAT-CIVIL
  // pas de "id", mais un champ 'ref'
  @Index()
  @Column({ type: "integer" }) // unique par structure
  public ref: number;

  @Column({ type: "text" })
  public customRef: string;

  @Index()
  @Column({ type: "integer" })
  structureId: number;

  @ManyToOne(() => StructureTable, { lazy: true })
  @JoinColumn({ name: "structureId", referencedColumnName: "id" })
  structureFk?: Promise<StructureTable>;

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

  @Column({ type: "text", nullable: true })
  @Column({
    type: "jsonb",
    nullable: true,
    default: '{"email": false, "phone": false, "phoneNumber":null}',
  })
  public preference: UsagerPreferenceContact;

  // DOMICILIATION
  @Column({ type: "timestamptz", nullable: true })
  public datePremiereDom: Date;

  @Column({ type: "text", nullable: true, default: "INSTRUCTION" })
  public typeDom: UsagerTypeDom;

  @Column({ type: "jsonb" })
  public decision: UsagerDecision;

  @Column({ type: "jsonb" })
  public historique: UsagerVisibleHistoryDecision[];

  //
  // AYANTS DROITS
  @Column({ type: "jsonb", nullable: true })
  public ayantsDroits: UsagerAyantDroit[];

  //
  // INTERACTIONS
  @Column({
    type: "jsonb",
    // default:
    //   "{ dateInteraction: now(), enAttente: false, courrierIn: 0, recommandeIn: 0, colisIn: 0};",
  })
  public lastInteraction: UsagerLastInteractions;

  //
  // DOCUMENTS
  @Column({ type: "jsonb", default: "[]" })
  public docs: UsagerDoc[];

  @Column({ type: "jsonb", default: "[]" })
  public docsPath: string[];

  //
  // FORMULAIRE
  @Column({ type: "integer", default: 0 })
  public etapeDemande: number;

  @Column({ type: "jsonb", nullable: true })
  public rdv: UsagerRdv;

  @Column({
    type: "jsonb",
    // default:
    //   "{ accompagnement: null, accompagnementDetail: null, cause: null, causeDetail: null, commentaires: null, domiciliation: null, liencommune: null, pourquoi: null, pourquoiDetail: null, rattachement: null, raison: null, raisonDetail: null, residence: null, residenceDetail: null, revenus: null, revenusDetail: null, typeMenage: null }",
  })
  public entretien: UsagerEntretien;

  //
  // TRANSFERTS / NPAI / PROCURATION
  @Column({
    type: "jsonb",
  })
  public options: UsagerOptions;
}
