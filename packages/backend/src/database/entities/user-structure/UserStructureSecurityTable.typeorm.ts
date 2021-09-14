import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import {
  UserStructureSecurity,
  UserStructureSecurityEvent,
  UserStructureTokens,
} from "../../../_common/model";
import { StructureTable } from "../structure/StructureTable.typeorm";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { UserStructureTable } from "./UserStructureTable.typeorm";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "user_structure_security" })
export class UserStructureSecurityTable
  extends AppTypeormTable<UserStructureSecurityTable>
  implements UserStructureSecurity
{
  @Index()
  @Column({ type: "integer", unique: true, update: false })
  userId: number;

  @ManyToOne(() => UserStructureTable, { lazy: true })
  @JoinColumn({ name: "userId", referencedColumnName: "id" })
  userFk?: Promise<UserStructureTable>;

  @Index()
  @Column({ type: "integer" })
  structureId: number;

  @ManyToOne(() => StructureTable, { lazy: true })
  @JoinColumn({ name: "structureId", referencedColumnName: "id" })
  structureFk?: Promise<StructureTable>;

  @Column({ type: "jsonb", nullable: true })
  temporaryTokens: UserStructureTokens;

  @Column({ type: "jsonb", default: () => "'[]'" })
  eventsHistory: UserStructureSecurityEvent[];

  public constructor(entity?: Partial<UserStructureSecurityTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
