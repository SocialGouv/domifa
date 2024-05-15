import {
  BeforeInsert,
  Column,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { titleCase } from "typeorm/util/StringUtils";
import { StructureTable } from "..";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import {
  UserStructureRole,
  UserStructureMails,
  UserRightStatus,
  UserStructure,
} from "@domifa/common";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "user_structure" })
export class UserStructureTable
  extends AppTypeormTable<UserStructureTable>
  implements UserStructure
{
  @Index()
  @Column({ type: "text", unique: true, nullable: false })
  email: string;

  @Column({ type: "text", nullable: true })
  fonction: string;

  @Index()
  @Column({ type: "integer", unique: true })
  @Generated("increment")
  id: number;

  @Column({ type: "timestamptz", nullable: true })
  lastLogin: Date;

  @Column({ type: "text" })
  nom: string;

  @Column({ type: "text" })
  password: string;

  @Column({ type: "text" })
  prenom: string;

  @Column({ type: "text", default: "simple" })
  role: UserStructureRole;

  @Index()
  @ManyToOne(() => StructureTable, (structure) => structure.id, {
    onDelete: "CASCADE",
  })
  @Column({ type: "integer", nullable: false })
  @JoinColumn({ name: "structureId", referencedColumnName: "id" })
  structureId: number;

  @Column({ type: "jsonb", default: '{"guide": false, "import": false}' })
  mails: UserStructureMails;

  @Column({ type: "timestamptz", nullable: true })
  passwordLastUpdate: Date;

  @Column({ type: "boolean", default: true })
  verified: boolean;

  @Column({ type: "timestamptz", nullable: true })
  acceptTerms: Date;

  @Column({ type: "simple-array", nullable: true })
  territories: string[];

  @Column({ type: "text", default: "structure" })
  userRightStatus: UserRightStatus;

  @BeforeInsert()
  nameToUpperCase() {
    this.email = this.email.toLowerCase().trim();
    this.nom = titleCase(this.nom).trim();
    this.prenom = titleCase(this.prenom).trim();
  }

  public constructor(entity?: Partial<UserStructureTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
