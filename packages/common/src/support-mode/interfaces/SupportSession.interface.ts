import { UserStructureRole } from "../../users/user-structure/types/UserStructureRole.type";
import { SupportSessionRevokedReason } from "../types/SupportSessionRevokedReason.type";
import { SupportSessionStatus } from "../types/SupportSessionStatus.type";

export interface SupportSession {
  uuid?: string;
  supervisorId: number;
  supervisorEmail: string;
  structureId: number;
  targetUserStructureId: number;
  startDate: Date;
  expiresAt: Date;
  status: SupportSessionStatus;
  originalRole: UserStructureRole | null;
  revokedAt: Date | null;
  revokedBy: string | null;
  revokedReason: SupportSessionRevokedReason | null;
  createdAt?: Date;
  updatedAt?: Date;
}
