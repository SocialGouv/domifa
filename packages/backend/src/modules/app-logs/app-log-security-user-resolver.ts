import { UserStructureRole, UserSupervisorRole } from "@domifa/common";

import {
  userStructureRepository,
  userSupervisorRepository,
  userUsagerRepository,
} from "../../database";
import { AppLogActorType } from "./types";

export type UserSecurityLogProfile =
  | "user_structure"
  | "user_supervisor"
  | "usager";

// `userType` falls back to "anonymous" when the identifier matches no user —
// the caller is expected to stash `identifier` in `context` so the failed
// attempt can still be audited.
export type ResolvedUserForSecurityLog = {
  userStructureId?: number;
  userSupervisorId?: number;
  userUsagerId?: number;
  structureId?: number;
  role?: UserStructureRole | UserSupervisorRole;
  userType: AppLogActorType;
  identifier: string;
};

export async function resolveUserForSecurityLog(
  profile: UserSecurityLogProfile,
  identifier: string
): Promise<ResolvedUserForSecurityLog> {
  if (!identifier) {
    return { userType: "anonymous", identifier };
  }

  if (profile === "user_structure") {
    const user = await userStructureRepository.findOne({
      where: { email: identifier },
      select: { id: true, structureId: true, role: true },
    });
    if (user) {
      return {
        userType: "user_structure",
        userStructureId: user.id,
        structureId: user.structureId,
        role: user.role,
        identifier,
      };
    }
  } else if (profile === "user_supervisor") {
    const user = await userSupervisorRepository.findOne({
      where: { email: identifier },
      select: { id: true, role: true },
    });
    if (user) {
      return {
        userType: "user_supervisor",
        userSupervisorId: user.id,
        role: user.role,
        identifier,
      };
    }
  } else if (profile === "usager") {
    const user = await userUsagerRepository.findOne({
      where: { login: identifier },
      select: { id: true, structureId: true },
    });
    if (user) {
      return {
        userType: "usager",
        userUsagerId: user.id,
        structureId: user.structureId,
        identifier,
      };
    }
  }

  return { userType: "anonymous", identifier };
}
