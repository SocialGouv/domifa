import { Column, Entity, Generated, Index } from "typeorm";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { UserSupervisor, UserSupervisorRole } from "@domifa/common";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "user_supervisor" })
export class UserSupervisorTable
  extends AppTypeormTable<UserSupervisorTable>
  implements UserSupervisor
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

  @Column({ type: "timestamptz", nullable: true })
  passwordLastUpdate: Date;

  @Column({ type: "boolean", default: true })
  verified: boolean;

  @Column({ type: "timestamptz", nullable: true })
  acceptTerms: Date;

  @Column("jsonb", { default: () => "'[]'" })
  territories: string[];

  @Column({ type: "text", nullable: false })
  role: UserSupervisorRole;

  public constructor(entity?: Partial<UserSupervisorTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
