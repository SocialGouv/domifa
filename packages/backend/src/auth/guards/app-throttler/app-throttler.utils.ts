import jwtDecode from "jwt-decode";
import { UserStructureJwtPayload } from "../../../_common/model/jwt/user-structure-jwt-payload.interface";
import { UserSupervisorJwtPayload } from "../../../_common/model/jwt/user-supervisor-jwt-payload.interface";
import { UserUsagerJwtPayload } from "../../../_common/model/jwt/user-usager-jwt-payload.interface";
import { ThrottleBlockedJwtUser } from "./app-throttler.types";

type AnyJwtPayload =
  | UserStructureJwtPayload
  | UserUsagerJwtPayload
  | UserSupervisorJwtPayload;

function decodeJwtPayload(token: string): AnyJwtPayload | null {
  try {
    return jwtDecode<AnyJwtPayload>(token);
  } catch {
    return null;
  }
}

export function extractJwtUser(
  authHeader: string | undefined
): ThrottleBlockedJwtUser | undefined {
  const token = authHeader?.split(" ")[1];
  if (!token) {
    return undefined;
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    return undefined;
  }

  const base: ThrottleBlockedJwtUser = {
    userId: payload._userId,
    userProfile: payload._userProfile,
  };

  if (payload._userProfile === "structure") {
    const p = payload as UserStructureJwtPayload;
    return {
      ...base,
      email: p.email,
      structureId: p.structureId,
      role: p.role,
    };
  }

  if (payload._userProfile === "usager") {
    const p = payload as UserUsagerJwtPayload;
    return { ...base, structureId: p.structureId };
  }

  return base;
}
