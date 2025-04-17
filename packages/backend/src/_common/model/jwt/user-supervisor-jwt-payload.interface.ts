import { UseBaseJwtPayload } from "./user-base-jwt-payload.type";

export type UserSupervisorJwtPayload = UseBaseJwtPayload<"supervisor"> & {
  id: number;
};
