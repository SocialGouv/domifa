import { EntityDecision } from "../../../_core";
import { UserDeleteMotif, UserStatus } from "../../common-user/types";

export type UserSupervisorDecision = EntityDecision<
  UserStatus,
  UserDeleteMotif
>;
