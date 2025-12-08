import { Column, Entity } from "typeorm";

import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { UserStructureRole, UserSupervisorRole } from "@domifa/common";
import { AppLog, LogAction } from "../../../modules/app-logs/types";

@Entity({ name: "app_log" })
export class AppLogTable
  extends AppTypeormTable<AppLogTable>
  implements AppLog
{
  @Column({ type: "integer", nullable: true })
  public userId?: number;

  @Column({ type: "integer", nullable: true })
  public usagerRef: number;

  @Column({ type: "integer", nullable: true })
  public structureId: number;

  @Column({ type: "text" })
  public action: LogAction;

  @Column({ type: "json", nullable: true })
  public context: any;

  @Column({ type: "text", nullable: true })
  public role?: UserStructureRole | UserSupervisorRole;

  @Column({ type: "text", nullable: true })
  public createdBy?: string;

  public constructor(entity?: Partial<AppLogTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
