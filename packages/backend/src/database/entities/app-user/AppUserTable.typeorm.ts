<<<<<<< HEAD
import {
  Column,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
  BeforeInsert,
} from "typeorm";
import { StructureTable } from "..";
=======
import { BeforeInsert, Column, Entity, Generated, Index } from "typeorm";
>>>>>>> fix: import tests

import { titleCase } from "typeorm/util/StringUtils";

import {
  AppUser,
  AppUserMails,
  AppUserTokens,
  UserRole,
} from "../../../_common/model";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "app_user" })
export class AppUserTable
  extends AppTypeormTable<AppUserTable>
  implements AppUser {
  mail: AppUserMails;
  @Column({ type: "text", nullable: true, unique: true })
  _id: any; // obsolete mongo id: use `uuid` instead

  @Index()
  @Column({ type: "text", unique: true })
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
  role: UserRole;

  @Index()
  @Column({ type: "integer" })
  structureId: number;

  @ManyToOne(() => StructureTable, { lazy: true })
  @JoinColumn({ name: "structureId", referencedColumnName: "id" })
  structureFk?: Promise<StructureTable>;

  @Column({ type: "jsonb", nullable: true })
  temporaryTokens: AppUserTokens;

  @Column({ type: "jsonb", default: '{"guide": false, "import": false}' })
  mails: AppUserMails;

  @Column({ type: "timestamptz", nullable: true })
  passwordLastUpdate: Date;

  @Column({ type: "boolean", default: false })
  verified: boolean;

  @BeforeInsert()
  nameToUpperCase() {
    this.email = this.email.toLowerCase();
    this.nom = titleCase(this.nom);
    this.prenom = titleCase(this.prenom);
  }
}
