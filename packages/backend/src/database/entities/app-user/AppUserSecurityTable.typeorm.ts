import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { AppUserSecurity, AppUserTokens } from "../../../_common/model";
import { AppUserSecurityEvent } from "../../../_common/model/app-user/AppUserSecurityEvent.type";
import { StructureTable } from "../structure/StructureTable.typeorm";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { AppUserTable } from "./AppUserTable.typeorm";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "app_user_security" })
export class AppUserSecurityTable
  extends AppTypeormTable<AppUserSecurityTable>
  implements AppUserSecurity
{
  @Index()
  @Column({ type: "integer", unique: true, update: false })
  userId: number;

  @ManyToOne(() => AppUserTable, { lazy: true })
  @JoinColumn({ name: "userId", referencedColumnName: "id" })
  userFk?: Promise<AppUserTable>;

  @Index()
  @Column({ type: "integer" })
  structureId: number;

  @ManyToOne(() => StructureTable, { lazy: true })
  @JoinColumn({ name: "structureId", referencedColumnName: "id" })
  structureFk?: Promise<StructureTable>;

  @Column({ type: "jsonb", nullable: true })
  temporaryTokens: AppUserTokens;

  @Column({ type: "jsonb", default: () => "'[]'" })
  eventsHistory: AppUserSecurityEvent[];

  public constructor(entity?: Partial<AppUserSecurityTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
