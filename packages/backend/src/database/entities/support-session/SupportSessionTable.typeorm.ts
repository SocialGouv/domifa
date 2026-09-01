import { Column, Entity, Index } from "typeorm";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import {
  SupportSession,
  SupportSessionRevokedReason,
  SupportSessionStatus,
  UserStructureRole,
} from "@domifa/common";

@Index("IDX_support_session_structureId_status", ["structureId", "status"])
@Entity({ name: "support_session" })
export class SupportSessionTable
  extends AppTypeormTable<SupportSessionTable>
  implements SupportSession
{
  @Index()
  @Column({ type: "integer", nullable: false })
  supervisorId: number;

  @Column({ type: "text", nullable: false })
  supervisorEmail: string;

  @Index()
  @Column({ type: "integer", nullable: false })
  structureId: number;

  @Column({ type: "integer", nullable: false })
  targetUserStructureId: number;

  @Column({ type: "timestamptz", nullable: false })
  startDate: Date;

  @Column({ type: "timestamptz", nullable: false })
  expiresAt: Date;

  @Column({ type: "text", default: "ACTIVE" })
  status: SupportSessionStatus;

  // The target account's real role at the moment it was overwritten to
  // "support" — restored onto user_structure.role when this attachment
  // closes (see SupportSessionService.closeSession). Left populated after
  // close as a historical record.
  @Column({ type: "text", nullable: true })
  originalRole: UserStructureRole | null;

  @Column({ type: "timestamptz", nullable: true })
  revokedAt: Date | null;

  @Column({ type: "text", nullable: true })
  revokedBy: string | null;

  @Column({ type: "text", nullable: true })
  revokedReason: SupportSessionRevokedReason | null;

  public constructor(entity?: Partial<SupportSessionTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
