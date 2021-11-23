import { UseBaseJwtPayload } from "./user-base-jwt-payload.type";

export type UserAdminJwtPayload = UseBaseJwtPayload<"super-admin-domifa"> & {
  userId: number;
  lastLogin: Date;
};
