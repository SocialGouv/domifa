import { UserProfile } from "../../../_common/model";
import {
  userStructureRepository,
  userSupervisorRepository,
  userStructureSecurityRepository,
  userSupervisorSecurityRepository,
} from "../../../database";

// Strictly for user_structure & user_supervisor. Calling with "usager" used to
// silently fall through to the supervisor repository, leaking usager password
// writes into `user_supervisor`. We now fail loudly so any future call site has
// to use `userUsagerRepository` directly.
export function getUserRepository(userProfile: UserProfile) {
  if (userProfile === "usager") {
    throw new Error(
      "getUserRepository must not be called with 'usager' — use userUsagerRepository directly"
    );
  }
  return userProfile === "structure"
    ? userStructureRepository
    : userSupervisorRepository;
}

export function getUserSecurityRepository(userProfile: UserProfile) {
  if (userProfile === "usager") {
    throw new Error(
      "getUserSecurityRepository must not be called with 'usager' — use userUsagerSecurityRepository directly"
    );
  }
  return userProfile === "structure"
    ? userStructureSecurityRepository
    : userSupervisorSecurityRepository;
}
