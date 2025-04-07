import { AppEntity } from "../../_core/AppEntity.type";
import { UserUsagerSecurityEvent } from "./UserUsagerSecurityEvent.type";

export type UserUsagerSecurity = AppEntity & {
  userId: number;
  structureId: number;
  eventsHistory: UserUsagerSecurityEvent[];
};
