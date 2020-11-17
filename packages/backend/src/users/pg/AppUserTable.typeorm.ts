import { Column, Entity, Generated, Index } from "typeorm";
import { AppTypeormTable } from "../../database/AppTypeormTable.typeorm";
import {
  AppUser,
  AppUserMails,
  AppUserTokens,
  UserRole
} from "../../_common/model";

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

  @Column({ type: "jsonb", nullable: true })
  temporaryTokens: AppUserTokens;

  @Column({ type: "jsonb", default: '{"guide": false, "import": false}' })
  mails: AppUserMails;

  @Column({ type: "timestamptz", nullable: true })
  passwordLastUpdate: Date;

  @Column({ type: "boolean", default: false })
  verified: boolean;
}
