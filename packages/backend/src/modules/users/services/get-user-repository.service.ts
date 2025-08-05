import { UserProfile } from "../../../_common/model";
import {
  userStructureRepository,
  userSupervisorRepository,
  userStructureSecurityRepository,
  userSupervisorSecurityRepository,
} from "../../../database";

// Only for user_structure & user_supervisor
export function getUserRepository(userProfile: UserProfile) {
  return userProfile === "structure"
    ? userStructureRepository
    : userSupervisorRepository;
}

// Only for user_structure & user_supervisor
export function getUserSecurityRepository(userProfile: UserProfile) {
  return userProfile === "structure"
    ? userStructureSecurityRepository
    : userSupervisorSecurityRepository;
}
