import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import {
  UserUsagerSecurity,
  UserUsagerSecurityEvent,
} from "../../../_common/model";
import { StructureTable } from "../structure/StructureTable.typeorm";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { UserUsagerTable } from "./UserUsagerTable.typeorm";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "user_usager_security" })
export class UserUsagerSecurityTable
  extends AppTypeormTable<UserUsagerSecurityTable>
  implements UserUsagerSecurity
{
  @Index()
  @Column({ type: "integer", unique: true, update: false })
  userId: number;

  @ManyToOne(() => UserUsagerTable, { lazy: true })
  @JoinColumn({ name: "userId", referencedColumnName: "id" })
  userFk?: Promise<UserUsagerTable>;

  @Index()
  @Column({ type: "integer" })
  structureId: number;

  @ManyToOne(() => StructureTable, { lazy: true })
  @JoinColumn({ name: "structureId", referencedColumnName: "id" })
  structureFk?: Promise<StructureTable>;

  // @Column({ type: "jsonb", nullable: true })
  // temporaryTokens: UserUsagerTokens;

  @Column({ type: "jsonb", default: () => "'[]'" })
  eventsHistory: UserUsagerSecurityEvent[];

  // public constructor(entity?: Partial<UserUsagerSecurityTable>) {
  //   super(entity);
  //   Object.assign(this, entity);
  // }
}
