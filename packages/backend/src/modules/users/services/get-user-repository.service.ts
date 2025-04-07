import { UserProfile } from "../../../_common/model";
import {
  userStructureRepository,
  userSupervisorRepository,
  userStructureSecurityRepository,
  userSupervisorSecurityRepository,
} from "../../../database";

export function getUserRepository(userProfile: UserProfile) {
  return userProfile === "structure"
    ? userStructureRepository
    : userSupervisorRepository;
}

export function getUserSecurityRepository(userProfile: UserProfile) {
  return userProfile === "structure"
    ? userStructureSecurityRepository
    : userSupervisorSecurityRepository;
}
