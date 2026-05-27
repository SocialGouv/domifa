import { Column, Entity, Index } from "typeorm";

import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { UserStructureRole, UserSupervisorRole } from "@domifa/common";
import {
  AppLog,
  AppLogActorType,
  LogAction,
} from "../../../modules/app-logs/types";

@Entity({ name: "app_log" })
export class AppLogTable
  extends AppTypeormTable<AppLogTable>
  implements AppLog
{
  @Column({ type: "integer", nullable: true })
  public userId?: number;

  @Column({ type: "integer", nullable: true })
  public userStructureId?: number;

  @Column({ type: "integer", nullable: true })
  public userSupervisorId?: number;

  @Index()
  @Column({ type: "text", nullable: true })
  public userType?: AppLogActorType;

  @Column({ type: "integer", nullable: true })
  public usagerRef: number;

  @Index()
  @Column({ type: "uuid", nullable: true })
  public usagerUuid?: string;

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

  // Display name of the actor ("prenom nom"), captured at write time so the
  // structure-level activity listing can render a "Utilisateur" column
  // without a runtime LEFT JOIN. NULL for system / anonymous events.
  @Column({ type: "text", nullable: true })
  public userName?: string;

  public constructor(entity?: Partial<AppLogTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
