import {
  UserAdminAuthenticated,
  UserProfile,
  UserStructureAuthenticated,
} from "../../_common/model";
import { AppLog, AppLogActorType } from "./types";

// Maps a short UserProfile ("structure" | "supervisor" | "usager") to the
// AppLogActorType used on app_log rows. Use this when writing a log row whose
// SUBJECT is a user (target of a block, unblock, access-deny, etc.) and the
// caller only has the short profile string handy.
const USER_TYPE_BY_PROFILE: Record<UserProfile, AppLogActorType> = {
  structure: "user_structure",
  supervisor: "user_supervisor",
  usager: "usager",
};

export function userTypeFromProfile(profile: UserProfile): AppLogActorType {
  return USER_TYPE_BY_PROFILE[profile];
}

export type ActorFields = Pick<
  AppLog,
  | "userId"
  | "userStructureId"
  | "userSupervisorId"
  | "userType"
  | "role"
  | "structureId"
  | "userName"
>;

type StructureActorIdentity = Pick<
  UserStructureAuthenticated,
  "id" | "role" | "structureId"
> & {
  nom?: string;
  prenom?: string;
};
type SupervisorActorIdentity = Pick<UserAdminAuthenticated, "id" | "role"> & {
  nom?: string;
  prenom?: string;
};

type UsagerLogIdentity = { ref: number; uuid?: string };
type UsagerFields = Pick<AppLog, "usagerRef" | "usagerUuid">;

const formatUserName = (
  prenom?: string | null,
  nom?: string | null
): string | undefined => {
  const trimmed = `${prenom ?? ""} ${nom ?? ""}`.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const buildStructureActorFields = (
  user: StructureActorIdentity
): ActorFields => ({
  userId: user.id,
  userStructureId: user.id,
  userType: "user_structure",
  role: user.role,
  structureId: user.structureId,
  userName: formatUserName(user.prenom, user.nom),
});

export const buildSupervisorActorFields = (
  user: SupervisorActorIdentity
): ActorFields => ({
  userId: user.id,
  userSupervisorId: user.id,
  userType: "user_supervisor",
  role: user.role,
  userName: formatUserName(user.prenom, user.nom),
});

export const buildPortailUsagerActorFields = (
  userPortailUsagerId: number
): ActorFields => ({
  userId: userPortailUsagerId,
  userType: "usager",
});

export const SYSTEM_ACTOR_FIELDS: ActorFields = {
  userType: "system",
};

export const ANONYMOUS_ACTOR_FIELDS: ActorFields = {
  userType: "anonymous",
};

export const buildUsagerFields = (usager: UsagerLogIdentity): UsagerFields => ({
  usagerRef: usager.ref,
  usagerUuid: usager.uuid,
});
