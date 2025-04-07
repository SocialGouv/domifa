import { UseBaseJwtPayload } from "./user-base-jwt-payload.type";

export type UserAdminJwtPayload = UseBaseJwtPayload<"supervisor"> & {
  userId: number;
  lastLogin: Date;
};
