import { UseBaseJwtPayload } from "./user-base-jwt-payload.type";

export type UserSupervisorJwtPayload = UseBaseJwtPayload<"supervisor"> & {
  id: number;
  // Hash of (userUUID|ip|ua) captured at login. Required: any JWT without
  // this claim is rejected at validation time, forcing a re-login. In v1
  // the hash comparison itself only logs mismatches; phase 2 will block.
  fingerprintHash: string;
};
