import { Column, Entity } from "typeorm";
import { AppLog, LogAction } from "../../../_common/model";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { UserStructureRole, UserSupervisorRole } from "@domifa/common";

@Entity({ name: "app_log" })
export class AppLogTable
  extends AppTypeormTable<AppLogTable>
  implements AppLog
{
  @Column({ type: "integer" })
  public userId: number;

  @Column({ type: "integer", nullable: true })
  public usagerRef: number;

  @Column({ type: "integer", nullable: true })
  public structureId: number;

  @Column({ type: "text" })
  public action: LogAction;

  @Column({ type: "text", nullable: true })
  public role?: UserStructureRole | UserSupervisorRole;

  @Column({ type: "text", nullable: true })
  public createdBy?: string;

  public constructor(entity?: Partial<AppLogTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
