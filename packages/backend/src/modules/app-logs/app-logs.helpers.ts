import {
  UserAdminAuthenticated,
  UserStructureAuthenticated,
} from "../../_common/model";
import { AppLog } from "./types";

type ActorFields = Pick<
  AppLog,
  | "userId"
  | "userStructureId"
  | "userSupervisorId"
  | "userType"
  | "role"
  | "structureId"
>;

type StructureActorIdentity = Pick<
  UserStructureAuthenticated,
  "id" | "role" | "structureId"
>;
type SupervisorActorIdentity = Pick<UserAdminAuthenticated, "id" | "role">;

type UsagerLogIdentity = { ref: number; uuid?: string };
type UsagerFields = Pick<AppLog, "usagerRef" | "usagerUuid">;

export const buildStructureActorFields = (
  user: StructureActorIdentity
): ActorFields => ({
  userId: user.id,
  userStructureId: user.id,
  userType: "user_structure",
  role: user.role,
  structureId: user.structureId,
});

export const buildSupervisorActorFields = (
  user: SupervisorActorIdentity
): ActorFields => ({
  userId: user.id,
  userSupervisorId: user.id,
  userType: "user_supervisor",
  role: user.role,
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
