import { Column, Entity, Index } from "typeorm";

import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import {
  SecurityLogAction,
  UserStructureRole,
  UserSupervisorRole,
} from "@domifa/common";
import {
  AppLogActorType,
  AppLogSecurity,
} from "../../../modules/app-logs/types";

@Index("IDX_app_log_security_action_createdAt", ["action", "createdAt"])
@Entity({ name: "app_log_security" })
export class AppLogSecurityTable
  extends AppTypeormTable<AppLogSecurityTable>
  implements AppLogSecurity
{
  @Column({ type: "integer", nullable: true })
  public userStructureId?: number;

  @Column({ type: "integer", nullable: true })
  public userSupervisorId?: number;

  @Index("IDX_app_log_security_userType")
  @Column({ type: "text", nullable: true })
  public userType?: AppLogActorType;

  @Column({ type: "integer", nullable: true })
  public structureId?: number;

  @Column({ type: "text" })
  public action: SecurityLogAction;

  @Column({ type: "json", nullable: true })
  public context: any;

  @Column({ type: "text", nullable: true })
  public role?: UserStructureRole | UserSupervisorRole;

  @Column({ type: "text", nullable: true })
  public createdBy?: string;

  @Index("IDX_app_log_security_ip")
  @Column({ type: "text", nullable: true })
  public ip?: string;

  @Column({ type: "text", nullable: true })
  public userAgent?: string;

  public constructor(entity?: Partial<AppLogSecurityTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
